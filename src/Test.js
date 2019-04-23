import React, {Component} from 'react';
import GameConnection from "./utils/gameConnection";
import cfg from './config';
import {getDeepProp} from "./utils/functions";
import {onEvents} from "./utils/constants";

class Test extends Component {
    constructor(props) {
        super(props);

        this.player1 = {
            id: undefined,
            connection: new GameConnection(cfg.apiUrl),
            roomID: undefined
        };
        this.player2 = {
            id: undefined,
            connection: new GameConnection(cfg.apiUrl),
            roomID: undefined
        };
        this.player1.connection.events = this.player2.connection.events = this.gameEvents;

        this.players = [this.player1, this.player2];
    }

    componentDidMount() {
        this.establishConnect()
            .then(res => {
                return Promise.all([
                    this.placeShips(this.player1),
                    this.placeShips(this.player2),
                ])
            })
    }

    emitShoot = () => {
        let shotsCounter = 2;

        return shooter => {
            const p = this.players.find(p => p.id === shooter);
            if (shotsCounter < 5) {
                p.connection.emitShot([shotsCounter++, 3], res => {
                    console.log(res);
                })
            }

        }
    }

    get gameEvents() {
        return [
            {
                eventName: onEvents.startShipsPlacement,
                eventHandler: () => {
                    // console.log('startShipsPlacement')
                }
            },
            {
                eventName: onEvents.startGame,
                eventHandler: () => {
                    // console.log('startGame')
                }
            },
            {
                eventName: onEvents.opponentShoot,
                eventHandler: () => {
                    // console.log('opponentShoot')
                }
            },
            {
                eventName: onEvents.assignShooter,
                eventHandler: this.emitShoot()
            },
            {
                eventName: 'opponentDisconnect',
                // eventHandler: () => console.log('opponentDisconnect')
            },
            {
                eventName: 'opponentReconnect',
                // eventHandler: () => console.log('opponentReconnect')
            },
            {
                eventName: 'roomDestroyed',
                // eventHandler: () => console.log('roomDestroyed')
            }
        ]
    };

    establishConnect() {
        return Promise.all([
            this.player1.connection.createPlayer(),
            this.player2.connection.createPlayer(),
        ])
            .then(res => {
                this.player1.id = res[0];
                this.player2.id = res[1];

                return this.player1.connection.createRoom({}, this.player1.id);
            })
            .then(roomID => {
                this.player1.roomID = this.player2.roomID = roomID;
                return Promise.all([
                    this.player1.connection._initSocketConnection(),
                    this.player2.connection._initSocketConnection()
                ])
            })
            .then(() => {
                return Promise.all([
                    this.player1.connection._playerInit(this.player1.id),
                    this.player2.connection._playerInit(this.player2.id)
                ])
            })
            .then(() => {
                return Promise.all([
                    this.player1.connection._subscribeSocketToEvents(),
                    // this.player2.connection._subscribeSocketToEvents()
                ])
            })
            .then(() => {
                return Promise.all([
                    this.player1.connection._knockToRoom(this.player1.roomID),
                    this.player2.connection._knockToRoom(this.player2.roomID)
                ])
            })
    }

    placeShips(player) {
        const shipsPlacementData = [
            {
                "id": "f791a4d3-8703-4801-b2f9-54711a4d4eff",
                "parts": {
                    "3;1": {"x": 3, "y": 1, "id": "f791a4d3-8703-4801-b2f9-54711a4d4eff_1", "type": "ship"},
                    "4;1": {"x": 4, "y": 1, "id": "f791a4d3-8703-4801-b2f9-54711a4d4eff_2", "type": "ship"},
                    "5;1": {"x": 5, "y": 1, "id": "f791a4d3-8703-4801-b2f9-54711a4d4eff_3", "type": "ship"}
                },
                "length": 3
            },
            {
                "id": "1bf8c1f1-b397-4216-981a-4301e4df288e",
                "parts": {
                    "2;3": {"x": 2, "y": 3, "id": "1bf8c1f1-b397-4216-981a-4301e4df288e_1", "type": "ship"},
                    "3;3": {"x": 3, "y": 3, "id": "1bf8c1f1-b397-4216-981a-4301e4df288e_2", "type": "ship"},
                    "4;3": {"x": 4, "y": 3, "id": "1bf8c1f1-b397-4216-981a-4301e4df288e_3", "type": "ship"}
                },
                "length": 3
            },
            {
                "id": "c237dfba-ad9b-4066-9e26-30c528364d25",
                "parts": {
                    "2;6": {"x": 2, "y": 6, "id": "c237dfba-ad9b-4066-9e26-30c528364d25_1", "type": "ship"},
                    "3;6": {"x": 3, "y": 6, "id": "c237dfba-ad9b-4066-9e26-30c528364d25_2", "type": "ship"},
                    "4;6": {"x": 4, "y": 6, "id": "c237dfba-ad9b-4066-9e26-30c528364d25_3", "type": "ship"},
                    "5;6": {"x": 5, "y": 6, "id": "c237dfba-ad9b-4066-9e26-30c528364d25_4", "type": "ship"}
                },
                "length": 4
            }
        ]
        return player.connection.emitPlacementDone(shipsPlacementData)
    }

    render() {
        return (
            <div>

            </div>
        );
    }
}

Test.propTypes = {};

export default Test;