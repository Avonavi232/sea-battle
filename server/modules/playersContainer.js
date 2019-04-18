class PlayersContainer{
    constructor(){
        this.players = new Set();
    }

    add(player){
        this.players.add(player);
        return this;
    }

    /**
     *
     * @param playerID {string}
     * @returns Player instance
     */
    get(playerID){
        return Array
            .from(this.players)
            .find(player => player.playerID === playerID);
    }

    /**
     *
     * @param playerID {string}
     * @returns PlayersContainer instance
     */
    remove(playerID){
        const player = this.get(playerID);

        if (player) {
            this.players.delete(player);
        }
        return this;
    }

    get length(){
        return this.players.size;
    }
}

module.exports = PlayersContainer;