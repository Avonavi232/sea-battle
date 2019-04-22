const
	uuid = require('uuid'),
	ShipsMap = require('./shipsMap'),
	Ship = require('./ship'),
	{shipsMapEvenets} = require('../utils/constants');

class Player {
	constructor() {
		this.playerID = uuid.v4();
		this.socket = null;
		this.io = null;
		this.roomID = null;
		this.shipsMap = new ShipsMap();
		this.playerShotsMap = [];
		this.opponentShotsMap = [];
		this.shipsPlaced = false;
		this.playersContainer = null;

		this.status = 'offline';

		this.statistics = {
			wins: 0
		};

		this.listen = this.listen.bind(this);
	}

	isSocketReady(){
		try {
			if (!this.socket || !this.socket.connected) {
				throw new Error('socket is not defined or offline');
			}

			return true;
		} catch (e) {
			console.log(e);
			return false
		}
	}

	isSocketInRoom(){
		try {
			if (!this.roomID) {
				throw new Error('Player does not contain roomID yet');
			}

			const socketRooms = Object.keys(this.socket.rooms);
			if (!socketRooms.includes(this.roomID)) {
				throw new Error('This player socket have not joined to the room yet');
			}

			return true;
		} catch (e) {
			console.log(e);
			return false
		}
	}

	setSocket(socket, io){
		this.socket = socket;
		this.io = io;
	}

	listen(event, callback) {
		this.socket.on(event, callback.bind(this));
	}

	sendToMe(event, ...args) {
		if (this.isSocketReady()) {
			this.socket.emit(event, ...args);
		}
	}

	sendToRoomExceptMe(event, ...args){
		if (this.isSocketReady() && this.isSocketInRoom()) {
			this.socket.to(this.roomID).emit(event, ...args);
		}
	}

	sendToRoom(event, ...args) {
		if (this.isSocketReady() && this.isSocketInRoom()) {
			this.io.to(this.roomID).emit(event, ...args);
		}
	}

	addShipToMap(shipData){
		const ship = new Ship(shipData);
		this.shipsMap.addShip(ship);
		this.shipsMap.subscribe(shipsMapEvenets.opponentShoot, ship.catchShoot);
	}

	storeOpponentShot(x, y, type){
		this.opponentShotsMap.push({x, y, type});
	}

	storePlayerShot(x, y, type){
		this.playerShotsMap.push({x, y, type});
	}

	handleShot(x, y){
		return this.shipsMap.emitShotEvent(x, y);
	}

	deletePlayer(){
		if (this.socket) {
			this.socket.eventNames().forEach(event => {
				this.socket.removeAllListeners(event);
			});
			this.socket = null;
		}

		this.io = null;
		this.playersContainer.remove(this.playerID);
	}
}

module.exports = Player;