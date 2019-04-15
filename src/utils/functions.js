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

function EventEmitter(){
    this.callbacks = Object.create(null);

    this.subscribe = function(eventName, callback) {
        this.callbacks[eventName] = this.callbacks[eventName] || [];
        this.callbacks[eventName].push(callback);
        return () => {this.callbacks[eventName] = this.callbacks[eventName].filter(cb => cb !== callback)};
    };

    this.emit = function(eventName, args){
        const callbacks = this.callbacks[eventName];
        if (callbacks && callbacks.length) {
            callbacks.forEach(cb => typeof cb === 'function' && cb.apply(null, args))
        }
    }
}

export const eventsBus = new EventEmitter();

export const mapToGrid = (items, getComponent, onClick, converter) => {
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
            {...item.data}
            onClick={() => onClick(item.x, item.y)}
        >
            {item.content}
        </Component>
    });
};

export const mapShipsToGrid = ships => {
    const getComponent = shipPart => {
        switch (shipPart.type) {
            case BasicShip.types.die:
                return Styled.ShipDieCell;

            case BasicShip.types.shot:
                return Styled.ShipShotCell;

            case BasicShip.types.default:
            default:
                return Styled.ShipCell
        }
    };

    return ships.map(ship => mapToGrid(
        Object.values(ship.parts),
        getComponent,
        null,
        (x,y)=>({x: x+2, y: y+2})
    ))
};

