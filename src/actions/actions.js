import * as C from './actionTypes';
import {eventsBus} from "../utils/functions";
import {busEvents} from "../utils/constants";


export const setNotPlacedShips = ships => ({
    type: C.SET_NOT_DISTRIBUTED_SHIPS,
    payload: {ships}
});

export const addPlayerShip = ship => {
    eventsBus.subscribe(busEvents.opponentShoot, ship.catchShoot);
    return {
        type: C.ADD_PLAYER_SHIP,
        payload: {ship}
    }
};

export const updatePlayerShip = ship => ({
    type: C.UPDATE_PLAYER_SHIP,
    payload: {ship}
});

export const setCurrent = ship => ({
    type: C.SET_CURRENT,
    payload: {ship}
});

export const addShotToMap = shots => ({
    type: C.ADD_SHOT_TO_MAP,
    payload: {shots}
});

export const addOpponentShotToMap = shot => ({
    type: C.ADD_OPPONENT_SHOT_TO_MAP,
    payload: {shot}
});

export const assignShooter = iAmShooter => ({
    type: C.ASSIGN_SHOOTER,
    payload: {iAmShooter}
});

export const setVolume = volume => ({
    type: C.SET_VOLUME,
    payload: {volume}
});





export const setRoomSettings = settings => ({
    type: C.SET_ROOM_SETTINGS,
    payload: {settings}
});


export const setGameStatus = status => ({
    type: C.SET_GAME_STATUS,
    payload: {status}
});


export const resetState = () => ({
    type: C.RESET_STATE
});

export const playerMove = payload => ({
    type: C.PLAYER_MOVE,
    payload
});

export const opponentMove = payload => ({
    type: C.OPPONENT_MOVE,
    payload
});

export const clearMoves = () => ({
    type: C.CLEAR_MOVES,
});

export const setWin = payload => ({
    type: C.SET_WIN,
    payload
});

export const increasePlayerWinsCounter = () => ({
    type: C.INCREASE_PLAYER_WINS_COUNTER
});

export const increaseOpponentWinsCounter = () => ({
    type: C.INCREASE_OPPONENT_WINS_COUNTER
});

export const pushMessagesArchive = payload => ({
    type: C.PUSH_MESSAGES_ARCHIVE,
    payload
});

export const clearMessagesArchive = payload => ({
    type: C.CLEAR_MESSAGES_ARCHIVE,
    payload
});

export const pushMatchesArchive = payload => ({
    type: C.PUSH_MATCHES_ARCHIVE,
    payload
});

export const clearMatchesArchive = payload => ({
    type: C.CLEAR_MATCHES_ARCHIVE,
    payload
});

export const restoreMatchesArchive = payload => ({
    type: C.RESTORE_MATCHES_ARCHIVE,
    payload
});


