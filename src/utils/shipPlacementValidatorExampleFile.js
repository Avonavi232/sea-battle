import {shipPlacementValidatorCreator, rule1, rule2} from "./functions";

const
    boardSize = 3,
    hoversGrid = [],
    goingToBePlaced = {
        length: 2,
        checkDirection: () => false
    },
    playerShips = {
        '0;1': {x: 2, y: 2},
    };

for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
        hoversGrid.push({x, y});
    }
}

export const validator = shipPlacementValidatorCreator();

validator.addRule(rule1);
validator.addRule(rule2);
validator.setBoardSize(boardSize);

console.log(hoversGrid.filter(coords => validator.validate(coords, goingToBePlaced, playerShips)));