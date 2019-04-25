const shipsMapEvenets = {
  opponentShoot: 'opponentShoot',
};

const fromClient = {
  playerInit: 'playerInit',
  shoot: 'shoot',
  placementDone: 'placementDone',
  knockToRoom: 'knockToRoom',
  disconnect: 'disconnect',
  chatMessage: 'chatMessage',
  leaveRoom: 'leaveRoom'
};

const toClient = {
  opponentsShipsPlaced: 'opponentsShipsPlaced',
  startShipsPlacement: 'startShipsPlacement',
  startGame: 'startGame',
  assignShooter: 'assignShooter',
};

module.exports = {shipsMapEvenets, fromClient, toClient};