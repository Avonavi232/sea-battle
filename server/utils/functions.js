const subscribePlayerToSocketEvents = (events = [], player) => {
    events.forEach(event => {
        player.socket.on(event.name, event.handlerCreator(player));
    });
};

const unsubscribeSocketFromEvents = (eventNames = [], socket) => {
    socket.eventNames()
        .filter(name => Array.isArray(eventNames) && eventNames.includes(name))
        .forEach(event => {
            socket.removeAllListeners(event);
        });
};

module.exports = {
    subscribePlayerToSocketEvents,
    unsubscribeSocketFromEvents
};