import React from "react";

import * as Styled from "../styled";
import {BasicShip} from "./ships";
import config from '../config';

export function getDeepProp(object, path) {
    const p = path.split('.');
    return p.reduce((xs, x) => (xs && xs[x] !== undefined ? xs[x] : undefined), object);
}

export function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

export const notEmpty = arr => {
    return Array.isArray(arr) && arr.length;
};

export const createReducer = (initialState, handlers) => (state = initialState, action) => {
    if (!action || !action.type) {
        return state;
    }
    const handler = handlers[action.type];
    if (typeof handler === 'function') {
        return handler(state, action.payload);
    }
    return state;
};

export const between = (number, from, to) => {
    return from < number && number < to;
};

function EventEmitter() {
    this.callbacks = Object.create(null);

    this.subscribe = function (eventName, callback) {
        this.callbacks[eventName] = this.callbacks[eventName] || [];
        this.callbacks[eventName].push(callback);
        return () => {
            this.callbacks[eventName] = this.callbacks[eventName].filter(cb => cb !== callback)
        };
    };

    this.emit = function (eventName, args) {
        const callbacks = this.callbacks[eventName];
        if (callbacks && callbacks.length) {
            return callbacks.map(cb => typeof cb === 'function' && cb.apply(null, args))
        }
    }
}

export const eventsBus = new EventEmitter();

/**
 * @param converter
 * @returns {function(*, *, *=): *}
 */
const getMapToGrid = converter => (items, getComponent, onClick) => {
    onClick = onClick || Function.prototype;
    return items.map((item, index) => {
        const
            {x: gridX, y: gridY} = typeof converter === 'function' ? converter(item.x, item.y) : item,
            Component = getComponent(item);

        return <Component
            key={item.id || index}
            x={gridX}
            y={gridY}
            w={1}
            h={1}
            onClick={() => onClick(item.x, item.y)}
        >
            {item.content}
        </Component>
    });
};


/**
 *
 * @param obj
 * @example
 * {
 *   'azaza': { 1;2': {x: 2, y: 1, type: 'hit'}, 2;2': {x: 2, y: 2, type: 'hit'},
 *   'ololo': { 1;2': {x: 2, y: 1, type: 'hit'}, 2;2': {x: 2, y: 2, type: 'hit'},
 * }
 * @returns {array}
 * @example [ {x: 1, y: 2, type: hit}, {x: 2, y: 2, type: hit} ]
 */
export const shotsMapAdapter = obj => {
    return Object.values(obj).reduce((acc, el) => acc.concat(Object.values(el)), []);
};

export const mapToGridShiftBy1 = getMapToGrid((x, y) => ({x: x + 1, y: y + 1}));

export const mapToGridShiftBy2 = getMapToGrid((x, y) => ({x: x + 2, y: y + 2}));

export const mapShipsToGrid = ships => {
    const getComponent = shipPart => {
        switch (shipPart.type) {
            case BasicShip.types.kill:
                return Styled.ShipDieCell;

            case BasicShip.types.hit:
                return Styled.ShotHitCell;

            case BasicShip.types.ship:
            default:
                return Styled.ShipCell
        }
    };

    return ships.map(ship => mapToGridShiftBy2(Object.values(ship.parts), getComponent))
};

export const debounce = (fn, delay) => {
    let timer = null;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
};


export const shipPlacementValidatorCreator = () => {
    let
        _rules = [],
        _boardSize = null;

    const addRule = ruleCallback => {
        _rules.push(ruleCallback)
    };

    const validate = (coords, shipToPlace, field) => {
        for (const rule of _rules) {
            if (!rule({coords, boardSize: _boardSize, field, shipToPlace})) {
                return false;
            }
        }
        return true;
    };

    const setBoardSize = boardSize => _boardSize = boardSize;

    return {setBoardSize, addRule, validate};
};

export const
    rule1 = ({coords, field, shipToPlace}) => {
        const
            dir = shipToPlace.checkDirection(),
            shipCoordsIter = i => ({x: coords.x + (dir ? i : 0), y: coords.y + (dir ? 0 : i)}),
            validateUponRule = ({x, y}) => {
                return !field[`${x};${y}`]
                    && !field[`${x + 1};${y + 1}`]
                    && !field[`${x + 1};${y - 1}`]
                    && !field[`${x - 1};${y + 1}`]
                    && !field[`${x - 1};${y - 1}`]
                    && !field[`${x - 1};${y}`]
                    && !field[`${x + 1};${y}`]
                    && !field[`${x};${y - 1}`]
                    && !field[`${x};${y + 1}`];
            };

        for (let i = 0; i < shipToPlace.length; i++) {
            if (!validateUponRule(shipCoordsIter(i))) {
                return false;
            }
        }
        return true;
    },
    rule2 = ({boardSize, shipToPlace, coords}) => {
        if (shipToPlace.checkDirection()) {
            return boardSize >= shipToPlace.length + coords.x
        } else {
            return boardSize >= shipToPlace.length + coords.y
        }
    };

export const shipPlacementValidator = shipPlacementValidatorCreator();
shipPlacementValidator.addRule(rule1);
shipPlacementValidator.addRule(rule2);
shipPlacementValidator.setBoardSize(config.boardSize);