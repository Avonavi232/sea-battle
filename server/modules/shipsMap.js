const
    {EventsBus} = require('./eventsBus'),
    Ship = require('./ship'),
    {shipsMapEvenets} = require('../utils/constants');

class ShipsMap extends EventsBus {
    constructor() {
        super();
        this.ships = [];
    }

    addShip(ship) {
        this.ships.push(ship);
    }

    get length() {
        return this.ships.length;
    }

    emitShotEvent(x, y) {
        let results = this.emit(shipsMapEvenets.opponentShoot, [x, y]).filter(el => !!el);

        return results.length ? results[0] : [];
    }
}

module.exports = ShipsMap;