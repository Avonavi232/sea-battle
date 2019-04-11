import config from '../config';

const letters = [], digits = [];

for (let i = 0; i < config.boardSize; i++) {
    letters.push({
        x: i + 2,
        y: 1,
        content: config.alphabete[i].toUpperCase()
    });
    digits.push({
        x: 1,
        y: i + 2,
        content: i + 1
    });
}

export const symbols = [].concat(letters, digits);


export const hoversGrid = [];

for (let i = 0; i < config.boardSize; i++) {
    for (let j = 0; j < config.boardSize; j++) {
        hoversGrid.push({
            x: j + 2,
            y: i + 2,
            data: {
                'data-x': j + 1,
                'data-y': i + 1,
            }
        });
    }
}
