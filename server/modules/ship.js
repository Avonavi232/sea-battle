class Ship {
    constructor(params) {
        this.id = params.id;
        this.parts = params.parts;

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
                return Ship.types.kill
            }
            return Ship.types.hit
        }
    };
}

module.exports = Ship;