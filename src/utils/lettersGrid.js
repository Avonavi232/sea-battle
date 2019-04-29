import config from '../config';
import {boardElementTypes} from "./constants";


export const placementGrid = [];
export const aimsGrid = [];
export const boardCoordsGrid = [];

for (let i = 0; i < config.boardSize; i++) {
    boardCoordsGrid.push({
        x: i + 1,
        y: 0,
        content: config.alphabete[i].toUpperCase(),
        type: boardElementTypes.char,
        id: `${i + 1};${0};${config.alphabete[i].toUpperCase()}`
    });
    boardCoordsGrid.push({
        x: 0,
        y: i + 1,
        content: i + 1,
        type: boardElementTypes.char,
        id: `${0};${i + 1};${i + 1}`
    });
}


for (let y = 0; y < config.boardSize; y++) {
    for (let x = 0; x < config.boardSize; x++) {
        const base = {
            x,
            y
        };
        placementGrid.push({
            ...base,
            type: boardElementTypes.shipPlacement,
            id: `${x};${y};${boardElementTypes.shipPlacement}`
        });
        aimsGrid.push({
            ...base,
            type: boardElementTypes.aim,
            id: `${x};${y};${boardElementTypes.aim}`
        });
    }
}
