import miss2 from './miss2.mp3';
import miss3 from './miss3.mp3';
import hit1 from './shipHit.wav';

class SoundsBank {
    constructor() {
        this.sounds = {};
    }

    addSound = (type, sound) => {
        if (!this.sounds[type]) {
            this.sounds[type] = [];
        }

        this.sounds[type].push(new Audio(sound));
        return this;
    };

    getRandomWithType = type => {
        const
            soundsWithType = this.sounds[type],
            randomIndex = Math.floor(Math.random() * soundsWithType.length);

        return soundsWithType[randomIndex];
    };

    getIndexWithType = (type, i) => {
        return this.sounds[type][i];
    }
}

const soundsBank = new SoundsBank();

soundsBank
    .addSound('miss', miss2)
    .addSound('miss', miss3)
    .addSound('hit', hit1);

export default soundsBank;


