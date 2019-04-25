export const gameStatuses = {
    initialServer: 1,
    waitingServer: 2,
    waitingClient: 3,
    shipPlacement: 4,
    active: 5,
    end: 6,
    connectError: 7,
};

export const gameSides = {
    client: 'client',
    server: 'server',
};

export const onEvents = {
    roomEntered: 'roomEntered',
    roomReconnected: 'roomReconnected',
    startShipsPlacement: 'startShipsPlacement',
    startGame: 'startGame',
    opponentShoot: 'opponentShoot',
    chatMessage: 'chatMessage',
    assignShooter: 'assignShooter',

    //default
    connectError: 'connect_error',
    reconnect: 'reconnect'
};

export const emitEvents = {
    playerInit: 'playerInit',
    knockToRoom: 'knockToRoom',
    chatMessage: 'chatMessage',
    reconnectToRoom: 'reconnectToRoom',
    placementDone: 'placementDone',
    shoot: 'shoot',
    leaveRoom: 'leaveRoom'
};

export const busEvents = {
  placeShip: 'placeShip',
  opponentShoot: 'opponentShoot',
};