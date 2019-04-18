class EventsBus {
    constructor() {
        this.events = {};

        this.subscribe = this.subscribe.bind(this);
        this.emit = this.emit.bind(this);
    }

    subscribe(event, callback) {
        if (!this.events[event]) {
            this.events[event] = new Set();
        }
        this.events[event].add(callback);
        return () => this.events[event].delete(callback);
    };

    emit(event, ...args){
        if (this.events[event]) {
            return Array.from(this.events[event]).map(cb => cb(...args));
        }
    }
}

module.exports = {
    EventsBus,
    eventsBus: new EventsBus()
};