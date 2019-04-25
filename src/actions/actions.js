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

export const toggleOpponentDisconnectedModal = isOpen => ({
    type: C.TOGGLE_OPPONENT_DISCONNECTED_MODAL,
    payload: {isOpen}
});

export const setRoomDestroyDeadline = deadline => ({
    type: C.SET_ROOM_DESTROY_DEADLINE,
    payload: {deadline}
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

export const updateOnlineRooms = roomsData => ({
    type: C.UPDATE_ONLINE_ROOMS,
    payload: {roomsData}
});



