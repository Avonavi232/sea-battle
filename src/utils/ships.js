import uuid from "uuid/v4";

class BasicShip{
    constructor(params) {
        this.parts = [];
        this.id = uuid();

        if (params) {
            this.pos = params;
        }
    }

    set pos({x, y, direction}){
        if (x && y && direction !== undefined) {
            this.start = {x, y};
            for (let i = 0; i < this.length; i++) {
                this.parts.push({
                    x: direction ? this.start.x : this.start.x + i,
                    y: !direction ? this.start.y : this.start.y + i,
                    id: `${this.id}_${i+1}`
                })
            }
        }
    }

    get length(){
        return 1;
    }
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