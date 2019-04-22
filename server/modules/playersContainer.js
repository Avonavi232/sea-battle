class PlayersContainer{
    constructor(){
        this.players = new Set();
    }

    add(player){
        this.players.add(player);
        player.playersContainer = this;
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
            return true;
        }
        return false;
    }

    get length(){
        return this.players.size;
    }
}

module.exports = PlayersContainer;