class RoomsContainer{
	constructor(){
		this.rooms = new Set();
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
			return this.rooms.delete(room);
		}

		return false;
	}
}

module.exports = RoomsContainer;