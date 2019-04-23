import React from "react";

import * as Styled from "../styled";
import {BasicShip} from "./ships";

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

