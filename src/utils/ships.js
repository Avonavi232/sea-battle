import uuid from "uuid/v4";
import {isNumeric} from "./functions";
import {updatePlayerShip} from "../actions";

export class BasicShip{
    constructor(params, dispatch) {
        this.id = uuid();
        this.parts = {};
        this.dispatch = dispatch || Function.prototype;

        if (params) {
            this.pos = params;
        }
    }

    static types = {
        default: 'ship',
        hit: 'hit',
        kill: 'kill'
    };

    set pos({x, y, direction}){
        if (isNumeric(x) && isNumeric(y) && direction !== undefined) {
            this.start = {x, y};
            for (let i = 0; i < this.length; i++) {
                const
                    x = direction ? this.start.x : this.start.x + i,
                    y = !direction ? this.start.y : this.start.y + i,
                    id = `${this.id}_${i+1}`;

                this.parts[`${x};${y}`] = { x, y, id, type: BasicShip.types.default };
            }
        }
    }

    get length(){
        //this is the default. Specific values will be set in the inheritors
        return 1;
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
        if (this.hasPart(x, y) && this.parts[`${x};${y}`].type === BasicShip.types.default) {
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
}

export class SingleShip extends BasicShip{
    get length(){
        return 1;
    }
}

export class DoubleShip extends BasicShip{
    get length(){
        return 2;
    }
}

export class TripleShip extends BasicShip{
    get length(){
        return 3;
    }
}

export class QuadrupleShip extends BasicShip{
    get length(){
        return 4;
    }
}