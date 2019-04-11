import * as C from '../actions/actionTypes';
import {createReducer} from "../utils/functions";

const initialState = {
    notDistributedShips: {},
    playerShips: [],
    current: null,
    phase: 1
};

const setNotDistributedShips = (state, {ships}) => ({
    ...state,
    notDistributedShips: ships
});

const addPlayerShip = (state, {ship}) => ({
    ...state,
    playerShips: state.playerShips.concat(ship)
});

const setCurrent = (state, {ship}) => ({
    ...state,
    current: ship
});

const setPhase = (state, {phase}) => ({
    ...state,
    phase
});

const handlers = {
    [C.SET_NOT_DISTRIBUTED_SHIPS]: setNotDistributedShips,
    [C.ADD_PLAYER_SHIP]: addPlayerShip,
    [C.SET_CURRENT]: setCurrent,
    [C.SET_PHASE]: setPhase,
};

const reducer = createReducer(initialState, handlers);

export default reducer;