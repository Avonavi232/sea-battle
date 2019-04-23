import uuid from "uuid/v4";
import {isNumeric} from "./functions";
import {updatePlayerShip} from "../actions";

export class BasicShip{
    constructor(params, dispatch) {
        this.id = uuid();
        this.parts = {};
        this.dispatch = dispatch || Function.prototype;
        this.length = 1;

        if (params) {
            this.pos = params;
        }
    }

    static types = {
        ship: 'ship',
        hit: 'hit',
        kill: 'kill'
    };

    set pos({x, y, direction}){
        if (isNumeric(x) && isNumeric(y) && direction !== undefined) {
            const start = {x, y};
            for (let i = 0; i < this.length; i++) {
                const
                    x = direction ? start.x : start.x + i,
                    y = !direction ? start.y : start.y + i,
                    id = `${this.id}_${i+1}`;

                this.parts[`${x};${y}`] = { x, y, id, type: BasicShip.types.ship };
            }
        }
    }

    hasPart(x, y){
        return this.parts.hasOwnProperty(`${x};${y}`);
    }

    isDie(){
        for (let key in this.parts) {
            if (this.parts[key].type !== BasicShip.types.hit) {
                return false;
            }
        }
        return true;
    }

    catchShoot = (x, y) => {

        if (this.hasPart(x, y) && this.parts[`${x};${y}`].type === BasicShip.types.ship) {
            this.parts[`${x};${y}`].type = BasicShip.types.hit;

            if (this.isDie()) {
                for (let key in this.parts) {
                    this.parts[key].type = BasicShip.types.kill;
                }
            }

            this.dispatch(updatePlayerShip(this)); //TODO: Move to callback
            return this.parts[`${x};${y}`].type;
        }
    };

    static recreate = (shipData, dispatch) => {
        const ship = new BasicShip(null, dispatch);
        ship.id = shipData.id;

        for(let key in shipData.parts){
            ship.parts[key] = {};
            ship.parts[key].x = shipData.parts[key].x;
            ship.parts[key].y = shipData.parts[key].y;
            ship.parts[key].type = BasicShip.types[shipData.parts[key].type];
        }

        ship.length = Object.keys(shipData.parts).length;

        return ship;
    }
}

export class SingleShip extends BasicShip{
    constructor(...args) {
        super(...args);
        this.length = 1;
    }
}

export class DoubleShip extends BasicShip{
    constructor(...args) {
        super(...args);
        this.length = 2;
    }
}

export class TripleShip extends BasicShip{
    constructor(...args) {
        super(...args);
        this.length = 3;
    }
}

export class QuadrupleShip extends BasicShip{
    constructor(...args) {
        super(...args);
        this.length = 4;
    }
}