import * as C from '../actions/actionTypes';
import {createReducer} from "../utils/functions";

const initialState = {
    notPlacedShips: {},
    playerShips: [],
    shotsMap: { },
    opponentShotsMap: [],
    current: null,
    iAmShooter: null,
    settings: {
        chatEnable: undefined,
        maxScore: undefined,
        roomID: undefined,
        roomURL: undefined,
        playerID: undefined,
        side: undefined
    },
    status: {
        gameStatus: -1
    }
};

const setNotDistributedShips = (state, {ships}) => ({
    ...state,
    notPlacedShips: ships
});

const addPlayerShip = (state, {ship}) => ({
    ...state,
    playerShips: state.playerShips.concat(JSON.parse(JSON.stringify(ship)))
});

const updatePlayerShip = (state, {ship}) => ({
    ...state,
    playerShips: JSON.parse(JSON.stringify([].concat( //TODO think about the object immutability
        state.playerShips.filter(({id}) => id !== ship.id),
        ship
    )))
});

const setCurrent = (state, {ship}) => ({
    ...state,
    current: ship
});

const setRoomSettings = (state, {settings}) => ({
    ...state,
    settings: {
        ...state.settings,
        ...settings
    }
});

const setGameStatus = (state, {status}) => ({
    ...state,
    status: {
        ...state.status,
        gameStatus: status
    }
});

const addShotToMap = (state, {shots}) => {
    const shotsMap = shots.reduce((acc, shot) => {
        acc[shot.shipID] = {
            ...acc[shot.shipID],
            [`${shot.x};${shot.y}`]: {
                x: shot.x,
                y: shot.y,
                type: shot.type
            }
        };
        return acc;
    }, {...state.shotsMap});

    return {
        ...state,
        shotsMap
    }
};

const addOpponentShotToMap = (state, {shot}) => ({
    ...state,
    opponentShotsMap: state.opponentShotsMap.concat(shot)
});

const assignShooter = (state, {iAmShooter}) => ({
    ...state,
    iAmShooter
});

const resetState = () => initialState;

const handlers = {
    [C.SET_NOT_DISTRIBUTED_SHIPS]: setNotDistributedShips,
    [C.ADD_PLAYER_SHIP]: addPlayerShip,
    [C.UPDATE_PLAYER_SHIP]: updatePlayerShip,
    [C.SET_CURRENT]: setCurrent,
    [C.SET_ROOM_SETTINGS]: setRoomSettings,
    [C.SET_GAME_STATUS]: setGameStatus,
    [C.ADD_SHOT_TO_MAP]: addShotToMap,
    [C.ADD_OPPONENT_SHOT_TO_MAP]: addOpponentShotToMap,
    [C.ASSIGN_SHOOTER]: assignShooter,
    [C.RESET_STATE]: resetState,
};

const reducer = createReducer(initialState, handlers);

export default reducer;