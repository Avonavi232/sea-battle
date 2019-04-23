const
    uuid = require('uuid'),
    {toClient} = require('../utils/constants'),
    Ship = require('../modules/ship');

class Room {
    constructor(io, settings = {}) {
        const defaultSetting = {
            chatEnable: true
        };

        this.roomID = uuid.v4();
        this.players = new Set();
        this.io = io;
        this.settings = Object.assign({}, defaultSetting, settings);

        this.currentShooter = null;
        this.rotateShootersTimerId = null;
        this.destroyRoomTimerId = null;
        this.timeForShoot = 15000;

        this.roomsContainer = null; //Will be the RoomsContainer instance, when room is added to it

        this.sendToRoom = this.sendToRoom.bind(this);
    }

    addPlayer(player) {
        return new Promise(resolve => {
            this.players.add(player);
            player.roomID = this.roomID;
            player.socket.join(this.roomID, () => resolve());
        })
    }

    joinSocketToRoom(socket) {
        return new Promise(resolve => {
            socket.join(this.roomID, () => resolve());
        })
    }

    isReadyToShipsPlacement() {
        return this.players.size === 2;
    }

    arePlayersReady() {
        for (let player of this.players.values()) {
            if (!player.shipsPlaced || !player.socket.connected) {
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

    /**
     *
     * @param {Player} player
     */
    startGame(player) {
        this.rotateShooters(player);
        this.sendToRoom(toClient.startGame);
    }

    rotateShooters(player) {
        this.currentShooter = player || this.getOpponent(this.currentShooter.playerID);
        this.assignShooter(this.currentShooter.playerID);

        clearTimeout(this.rotateShootersTimerId);
        this.rotateShootersTimerId = setTimeout(() => this.rotateShooters(), this.timeForShoot);
    }

    assignShooter(playerID) {
        this.sendToRoom(toClient.assignShooter, playerID, this.timeForShoot);
    }

    /**
     *
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

        this.rotateShooters( !isShotMissed && this.currentShooter);

        return shotResult;
    }

    get length() {
        return this.players.size;
    }


    destroyRoom(){
        this.roomsContainer.deleteRoom(this.roomID);
        clearTimeout(this.rotateShootersTimerId);
        clearTimeout(this.destroyRoomTimerId);

        Array.from(this.players)
            .forEach(player => player.deletePlayer());
        this.cancelScheduledRoomDestroy();

        this.sendToRoom('roomDestroyed');

        console.log('Room is deleted. Current active rooms: ', this.roomsContainer.rooms.size);
    }

    scheduleRoomDestroy(){
        this.destroyRoomTimerId = setTimeout(() => this.destroyRoom(), 5000);
    }

    cancelScheduledRoomDestroy(){
        console.log('room scheluded destroy canceled');
        clearTimeout(this.destroyRoomTimerId);
        this.destroyRoomTimerId = null;
    }

    handlePlayerDisconnect(player){
        this.sendToRoom('opponentDisconnect', {playerID: player.playerID});

        const onlinePlayers = Array.from(this.players)
            .filter(player => player.status === 'online');


        if (!onlinePlayers.length) {
            this.destroyRoom();
        } else if (onlinePlayers.length) {
            this.scheduleRoomDestroy();
        }
    }
}

module.exports = Room;