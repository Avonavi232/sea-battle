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

    get stats() {
        const
            aliveShips = this.ships.filter(ship => Object.values(ship.parts).find(el => el.type === Ship.types.ship)),
            cells = this.ships.reduce((acc, cur) => acc.concat(Object.values(cur.parts)), []),
            hitCells = cells.filter(cell => cell.type !== Ship.types.ship);

        return {
            shipsCount: this.ships.length,
            cellsCount: cells.length,
            hitCellsCount: hitCells.length,
            aliveShipsCount: aliveShips.length
        }
    }

    emitShotEvent(x, y) {
        let results = this.emit(shipsMapEvenets.opponentShoot, [x, y]).filter(el => !!el);
        return results.length ? results[0] : [];
    }
}

module.exports = ShipsMap;