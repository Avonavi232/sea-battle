import * as C from './actionTypes';


export const setNotDistributedShips = ships => ({
    type: C.SET_NOT_DISTRIBUTED_SHIPS,
    payload: {ships}
});

export const addPlayerShip = ship => ({
    type: C.ADD_PLAYER_SHIP,
    payload: {ship}
});

export const setCurrent = ship => ({
    type: C.SET_CURRENT,
    payload: {ship}
});
