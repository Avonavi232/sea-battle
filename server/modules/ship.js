class Ship {
    constructor(params) {
        this.id = params.id;
        this.parts = {};
        this.type = params.type;
        this.start = params.start;
        this.direction = params.direction;

        for(let [key, val] of Object.entries(params.parts)) {
            this.parts[key] = {
                shipID: this.id,
                partID: val.id,
                x: val.x,
                y: val.y,
                type: val.type
            }
        }

        this.catchShoot = this.catchShoot.bind(this);
    }

    static get types() {
        return {
            ship: 'ship',
            hit: 'hit',
            miss: 'miss',
            kill: 'kill'
        }
    };

    hasPart(x, y) {
        return this.parts.hasOwnProperty(`${x};${y}`);
    }

    isDie() {
        for (let key in this.parts) {
            if (this.parts[key].type !== Ship.types.hit) {
                return false;
            }
        }
        return true;
    }

    catchShoot([x, y]) {
        if (this.hasPart(x, y) && this.parts[`${x};${y}`].type === Ship.types.ship) {
            this.parts[`${x};${y}`].type = Ship.types.hit;

            if (this.isDie()) {
                for (let key in this.parts) {
                    this.parts[key].type = Ship.types.kill;
                }
                return Object.values(this.parts);
            }
            return [this.parts[`${x};${y}`]]
        }
    };
}

module.exports = Ship;