import config from '../config';

const letters = [], digits = [];

for (let i = 0; i < config.boardSize; i++) {
    letters.push({
        x: i + 1,
        y: 0,
        content: config.alphabete[i].toUpperCase()
    });
    digits.push({
        x: 0,
        y: i + 1,
        content: i + 1
    });
}

export const symbols = [].concat(letters, digits);


export const hoversGrid = [];

for (let y = 0; y < config.boardSize; y++) {
    for (let x = 0; x < config.boardSize; x++) {
        hoversGrid.push({ x, y });
    }
}
