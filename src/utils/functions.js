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

