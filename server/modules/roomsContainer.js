class RoomsContainer{
	constructor(io){
		this.rooms = new Set();
		this.io = io;

		this.getRoom = this.getRoom.bind(this);
	}

	addRoom(room){
		this.rooms.add(room);
		room.roomsContainer = this;
	}

    /**
     * @param roomID {string}
     * @returns Room instance
     */
	getRoom(roomID){
		return Array
			.from(this.rooms)
			.find(room => room.roomID === roomID);
	}

	deleteRoom(roomID){
		const room = this.getRoom(roomID);
		if (room) {
			this.rooms.delete(room);
			return true;
		}
		return false;
	}

	getRoomData(room){
		return {
			roomID: room.roomID,
			name: room.settings.name,
			protected: !!room.settings.password,
			online: room.players.size,
			size: room.settings.maxPlayers
		}
	}

	emitRoomsUpdated(room, toDelete){
		let data;
		if (room) {
			data = toDelete ? [{roomID: room.roomID, delete: true}] : [this.getRoomData(room)];
		} else {
			data = Array.from(this.rooms).map(room => this.getRoomData(room));
		}
		this.io.emit('roomUpdated', data);
	}
}

module.exports = RoomsContainer;