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
        this.timerID = null;
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
            if (!player.shipsPlaced) {
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

    rotateShooters(player, updateTimerOnly) {
        if (!updateTimerOnly) {
            player = player || this.currentShooter;
            this.currentShooter = this.getOpponent(player.playerID);
            this.assignShooter(this.currentShooter.playerID);
        }

        clearTimeout(this.timerID);
        this.timerID = setTimeout(() => this.rotateShooters(), this.timeForShoot);
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
            shootResult = opponent.handleShot(...coords);

        player.storePlayerShot(...coords, shootResult);
        opponent.storeOpponentShot(...coords, shootResult);

        this.rotateShooters(null, shootResult !== Ship.types.miss);
        shootResult !== Ship.types.miss && this.assignShooter(this.currentShooter.playerID);

        return shootResult;
    }

    get length() {
        return this.players.size;
    }
}

module.exports = Room;