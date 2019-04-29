import config from '../config';
import {boardElementTypes} from "./constants";

const letters = [], digits = [];

for (let i = 0; i < config.boardSize; i++) {
    letters.push({
        x: i + 1,
        y: 0,
        content: config.alphabete[i].toUpperCase(),
        type: boardElementTypes.char,
        id: `${i + 1};${0};${config.alphabete[i].toUpperCase()}`
    });
    digits.push({
        x: 0,
        y: i + 1,
        content: i + 1,
        type: boardElementTypes.char,
        id: `${0};${i + 1};${i + 1}`
    });
}

export const symbols = [].concat(letters, digits);

/**
 * Fully covered game field
 * @type {Array}
 */
export const coordsGrid = [];

for (let y = 0; y < config.boardSize; y++) {
    for (let x = 0; x < config.boardSize; x++) {
        coordsGrid.push({
            x,
            y,
            type: boardElementTypes.shipPlacement,
            id: `${x};${y}`
        });
    }
}
