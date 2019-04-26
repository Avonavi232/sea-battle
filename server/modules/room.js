const
    uuid = require('uuid'),
    {toClient, fromClient} = require('../utils/constants'),
    {subscribePlayerToSocketEvents, unsubscribeSocketFromEvents} = require('../utils/functions');

class Room {
    constructor(io, settings = {}, ownerID) {
        this.settings = {
            name: 'Default room name',
            password: null,
            timeForShoot: 15000,
            timeForRoomDestroy: 5000,
            maxPlayers: 2
        };

        this.settings.name = settings.name || this.settings.name;
        this.settings.password = settings.password || this.settings.password;



        this.owner = ownerID;
        this.roomID = uuid.v4();
        this.players = new Set();
        this.io = io;

        this.currentShooter = null;
        this.rotateShootersTimerId = null;
        this.destroyRoomTimerId = null;

        this.roomsContainer = null; //Will be the RoomsContainer instance, when room is added to it

        this.sendToRoom = this.sendToRoom.bind(this);
        this.placementDoneHandlerCreator = this.placementDoneHandlerCreator.bind(this);
        this.leaveRoomHandlerCreator = this.leaveRoomHandlerCreator.bind(this);
        this.shootHandlerCreator = this.shootHandlerCreator.bind(this);
    }

    addPlayer(player, password) {
        return new Promise((resolve, reject) => {
            if (this.settings.password && password !== this.settings.password) {
                reject('Password is wrong');
                return;
            } else if (this.players.size === this.settings.maxPlayers) {
                reject('The room is full');
                return;
            }

            this.players.add(player);
            player.roomID = this.roomID;
            subscribePlayerToSocketEvents(this.roomEvents, player);

            this.joinSocketToRoom(player.socket)
                .then(() => resolve())
        })
    }

    kickPlayer(player){
        if (this.players.has(player)) {
            this.players.delete(player);
            player.resetGameData();

            if (player.socket) {
                unsubscribeSocketFromEvents(this.roomEventsNames, player.socket);
                this.leaveSocketFromRoom(player.socket);
            }
        }
    }

    joinSocketToRoom(socket) {
        return new Promise(resolve => {
            socket.join(this.roomID, () => resolve());
        })
    }

    leaveSocketFromRoom(socket) {
        return new Promise(resolve => {
            socket.leave(this.roomID, () => resolve());
        })
    }

    isReadyToShipsPlacement() {
        return this.players.size === 2;
    }

    arePlayersReady() {
        if (this.players.size < 2) {
            return false;
        }

        for (let player of this.players.values()) {
            if (!player.shipsPlaced || !player.socket || !player.socket.connected) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param playerID {string}
     * @returns Player instance
     */
    getPlayer(playerID) {
        return Array
            .from(this.players)
            .find(player => player.playerID === playerID);
    }

    /**
     * @param playerID {string}
     * @returns Player instance
     */
    getOpponent(playerID) {
        return Array
            .from(this.players)
            .find(player => player.playerID !== playerID);
    }

    sendToRoom(event, ...args) {
        this.io.to(this.roomID).emit(event, ...args);
    }

    sendToAll(event, ...args) {
        this.io.emit(event, ...args);
    }

    /**
     * @param {Player} player
     */
    startGame(player) {
        this.rotateShooters(player);
        this.sendToRoom(toClient.startGame);
    }

    rotateShooters(player) {
        if (!this.arePlayersReady()) {
            clearTimeout(this.rotateShootersTimerId);
            return;
        }

        this.currentShooter = player || this.getOpponent(this.currentShooter.playerID);
        this.assignShooter(this.currentShooter.playerID);

        clearTimeout(this.rotateShootersTimerId);
        this.rotateShootersTimerId = setTimeout(() => this.rotateShooters(), this.settings.timeForShoot);
    }

    assignShooter(playerID) {
        this.sendToRoom(toClient.assignShooter, playerID, this.settings.timeForShoot);
    }

    /**
     * @param {Player} player
     * @param {array} coords
     */
    playerShoots(player, coords) {
        if (player.playerID !== this.currentShooter.playerID) {
            throw new Error('shooting player is not current shooter');
        }

        const
            opponent = this.getOpponent(player.playerID),
            shotResult = opponent.handleShot(...coords),
            isShotMissed = !shotResult[0];

        player.storePlayerShot(...coords, shotResult);
        opponent.storeOpponentShot(...coords, shotResult);

        const opponentStats = opponent.shipsMap.stats;

        this.rotateShooters(!isShotMissed && this.currentShooter);

        return {shotResult, opponentStats};
    }

    get length() {
        return this.players.size;
    }

    destroyRoom() {
        this.roomsContainer.deleteRoom(this.roomID);
        clearTimeout(this.rotateShootersTimerId);
        clearTimeout(this.destroyRoomTimerId);

        this.sendToRoom('roomDestroyed');

        Array.from(this.players)
            .forEach(player => this.kickPlayer(player));

        this.cancelScheduledRoomDestroy();

        this.roomsContainer.emitRoomsUpdated(this, true);
    }

    scheduleRoomDestroy() {
        this.destroyRoomTimerId = setTimeout(() => this.destroyRoom(), this.settings.timeForRoomDestroy);
    }

    cancelScheduledRoomDestroy() {
        clearTimeout(this.destroyRoomTimerId);
        this.destroyRoomTimerId = null;
    }

    playerLeftHandler(player) {
        const sendFn = player.socket.connected ? player.sendToRoomExceptMe.bind(player) : this.sendToRoom;

        sendFn('opponentDisconnect', {playerID: player.playerID, deadline: this.settings.timeForRoomDestroy});

        const onlinePlayers = Array.from(this.players)
            .filter(player => player.status === 'online');

        if (!onlinePlayers.length) {
            this.destroyRoom();
        } else if (onlinePlayers.length) {
            this.scheduleRoomDestroy();
        }
    }

    shootHandlerCreator(player) {
        const room = this;
        return (coords, ack) => {
            try {
                const {shotResult, opponentStats} = room.playerShoots(player, coords);

                ack(shotResult); //Ответ стреляющему

                player.sendToRoomExceptMe('opponentShoot', coords); //Ответ тому, в кого стреляют

                if (!opponentStats.aliveShipsCount) {
                    Array.from(this.players).forEach(player => {
                       const stats = player.shipsMap.stats;
                       player.sendToMe('gameOver', {stats});
                    });
                }


            } catch (e) {
                ack({error: e.message}); //Ответ стреляющему
            }
        };
    }

    placementDoneHandlerCreator(player) {
        const room = this;
        return (playerShipsData, ack = Function.prototype) => {
            playerShipsData.forEach(shipData => player.addShipToMap(shipData));

            if (playerShipsData.length === player.shipsMap.length) {
                player.shipsPlaced = true;
                player.sendToRoomExceptMe(toClient.opponentsShipsPlaced);
                ack(true);
            } else {
                return ack(false);
            }

            if (room.arePlayersReady()) {
                room.startGame(player);
            }
        };
    }

    leaveRoomHandlerCreator(player) {
        const room = this;
        return (ack = Function.prototype) => {
            room.kickPlayer(player);
            this.roomsContainer.emitRoomsUpdated(this);
            this.playerLeftHandler(player);
            ack();
        };
    }

    get roomEvents(){
        return [
            {
                name: fromClient.shoot,
                handlerCreator: this.shootHandlerCreator
            },
            {
                name: fromClient.placementDone,
                handlerCreator: this.placementDoneHandlerCreator
            },
            {
                name: fromClient.leaveRoom,
                handlerCreator: this.leaveRoomHandlerCreator
            },
        ];
    }

    get roomEventsNames(){
        return this.roomEvents.map(el => el.name);
    }
}

module.exports = Room;