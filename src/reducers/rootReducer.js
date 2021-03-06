import * as C from '../actions/actionTypes';
import {createReducer} from "../utils/functions";

const initialState = {
    notPlacedShips: {},
    playerShips: [],
    shotsMap: {},
    opponentShotsMap: [],
    current: null,
    iAmShooter: null,
    volume: 0.5,
    opponentDisconnectedModalOpen: false,
    roomDestroyDeadline: null,
    onlineRooms: {},
    gameResult: null,
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

const setVolume = (state, {volume}) => ({
    ...state,
    volume
});

const resetState = state => ({
    ...initialState,
    onlineRooms: state.onlineRooms,
    settings: {
        ...initialState.settings,
        playerID: state.settings.playerID,
    }
});


const toggleOpponentDisconnectedModal = (state, {isOpen}) => ({
    ...state,
    opponentDisconnectedModalOpen: isOpen
});

const setRoomDestroyDeadline = (state, {deadline}) => ({
    ...state,
    roomDestroyDeadline: deadline
});

const updateOnlineRooms = (state, {roomsData}) => {
    const updatedOnlineRooms = {...state.onlineRooms};

    roomsData.forEach(roomData => {
        if (roomData.delete) {
            delete updatedOnlineRooms[roomData.roomID]
        } else {
            updatedOnlineRooms[roomData.roomID] = {...roomData}
        }
    });

    return {
        ...state,
        onlineRooms: updatedOnlineRooms
    };
};

const setGameResult = (state, {stats}) => ({
    ...state,
    gameResult: stats
});

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
    [C.SET_VOLUME]: setVolume,
    [C.TOGGLE_OPPONENT_DISCONNECTED_MODAL]: toggleOpponentDisconnectedModal,
    [C.SET_ROOM_DESTROY_DEADLINE]: setRoomDestroyDeadline,
    [C.UPDATE_ONLINE_ROOMS]: updateOnlineRooms,
    [C.SET_GAME_RESULT]: setGameResult,
};

const reducer = createReducer(initialState, handlers);

export default reducer;