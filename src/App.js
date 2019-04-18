import React, {Component, createRef} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import io from 'socket.io-client';
import axios from 'axios';
import {parse} from 'query-string';
import shipHitSound from './sounds/shipHit.wav';

//Utils
import {symbols, hoversGrid} from "./utils/lettersGrid";
import {
    eventsBus,
    mapShipsToGrid,
    getDeepProp,
    mapToGridShiftBy1,
    mapToGridShiftBy2
} from "./utils/functions";
import config from './config';
import {emitEvents, gameSides, gameStatuses, onEvents, busEvents} from "./utils/constants";
import {gameConnection} from "./utils/gameConnection";

//Components
import * as Styled from './styled';
import ShipPlacementPanel from './ShipPlacementPanel';
import RoomCreator from './components/RoomCreator';
import ShootTimer from './components/Timer';

//Actions
import {
    setGameStatus,
    setRoomSettings,
    restoreMatchesArchive,
    addShotToMap,
    addOpponentShotToMap,
    assignShooter, updatePlayerShip, addPlayerShip
} from "./actions";
import {BasicShip} from "./utils/ships";


class App extends Component {
    constructor(props) {
        super(props);

        this.timerInstanceRef = createRef();
        this.state = {
            shootTime: null
        }
    }


    componentDidMount() {
        this.initConnection();

        /*Перед уходом из игры (релоад, выгрузка) сохраняем стейт*/
        window.addEventListener('beforeunload', this.saveGameHistory);
    }

    componentWillUnmount() {
        this.saveGameHistory();
    }

    initConnection() {
        gameConnection.events = this.gameEvents;

        gameConnection.restoreGame = restored => {
            const
                shipsMap = restored.shipsMap.ships,
                {opponentShotsMap, playerShotsMap} = restored;

            this.props.dispatch(addOpponentShotToMap(opponentShotsMap));
            this.props.dispatch(addShotToMap(playerShotsMap));

            shipsMap
                .map(shipData => BasicShip.recreate(shipData, this.props.dispatch))
                .forEach(ship => this.props.dispatch(addPlayerShip(ship)));
        };

        gameConnection.initConnection()
            .then(({settings, gameStatus}) => {
                this.props.dispatch(setRoomSettings(settings));
                gameStatus && this.props.dispatch(setGameStatus(gameStatus));
            })
            .catch(gameStatus => this.props.dispatch(setGameStatus(gameStatus)))
    }

    /*Сохранение/восстановление истории матча*/
    saveGameHistory = () => {
        if (this.props.gameStatus === gameStatuses.active) {
            localStorage.setItem(
                `game_save`,
                JSON.stringify({
                    playerID: this.props.playerID,
                    roomID: this.props.roomID
                })
            );
        } else {
            localStorage.removeItem(`game_save`);
        }
    };

    /*Socket.io events*/
    get gameEvents(){
        //Default events
        // socket.on(onEvents.connectError, this.connectErrorHandler);
        // socket.on(onEvents.reconnect, this.socketReconnectHandler);
        return [
            {
                eventName: onEvents.startShipsPlacement,
                eventHandler: this.startShipPlacementHandler
            },
            {
                eventName: onEvents.startGame,
                eventHandler: this.startGameHandler
            },
            {
                eventName: onEvents.opponentShoot,
                eventHandler: this.opponentShootHandler
            },
            {
                eventName: onEvents.chatMessage,
                eventHandler: this.receiveChatMessageHandler
            },
            {
                eventName: onEvents.assignShooter,
                eventHandler: this.assignShooterHandler
            }
        ]
    };

    startShipPlacementHandler = () => {
        this.props.dispatch(setGameStatus(gameStatuses.shipPlacement));
    };

    receiveChatMessageHandler = responce => {
        // const {dispatch, playerID} = this.props;
        //
        // dispatch(actions.pushMessagesArchive({
        //     message: responce.message,
        //     author: playerID === responce.playerID ? 'Me' : 'Opponent'
        // }));
    };

    opponentShootHandler = shot => {
        const result = eventsBus.emit(busEvents.opponentShoot, shot).filter(el => !!el);
        if (!result.length) {
            this.props.dispatch(addOpponentShotToMap({x: shot[0], y: shot[1], type: 'miss'}))
        }
    };

    startGameHandler = () => {
        this.props.dispatch(setGameStatus(gameStatuses.active));
    };

    assignShooterHandler = (shooterID, shootTime) => {
        this.setState({shootTime});
        this._updateTimer();
        this.props.dispatch(assignShooter(this.props.playerID === shooterID));
    };

    shoot = (x, y) => {
        return new Promise(resolve => gameConnection.emitShot([x, y], resolve))
            .then(result => {
                if (!result || result.error) {
                    throw new Error(result.error);
                }

                const shot = {x, y};
                if (result === 'hit') {
                    const audio = new Audio(shipHitSound);
                    audio.volume = 0.5;
                    audio.play();
                    shot.type = 'hit';
                } else if (result === 'miss') {
                    shot.type = 'miss';
                }
                this.props.dispatch(addShotToMap(shot));
            })
            .catch(e => console.error(e));
    };

    _updateTimer = () => {
        if (typeof getDeepProp(this.timerInstanceRef, 'current.init') === 'function') {
            this.timerInstanceRef.current.init();
        }
    };

    render() {
        const {gameStatus, iAmShooter} = this.props;
        const {shootTime} = this.state;

        return (
            <Styled.App>
                <Styled.GlobalStyle/>
                <Styled.Grid>
                    {/*<Styled.OpponentBoard>*/}
                    {/*    {*/}
                    {/*        mapToGridShiftBy1(*/}
                    {/*            symbols,*/}
                    {/*            () => Styled.LetterCell,*/}
                    {/*        )*/}
                    {/*    }*/}
                    {/*    {*/}
                    {/*        mapToGridShiftBy2(*/}
                    {/*            [*/}
                    {/*                {x: 1, y: 1},*/}
                    {/*                {x: 1, y: 4},*/}
                    {/*                {x: 3, y: 4},*/}
                    {/*            ],*/}
                    {/*            () => Styled.ShotHitCell,*/}
                    {/*        )*/}
                    {/*    }*/}
                    {/*    {*/}
                    {/*        mapToGridShiftBy2(*/}
                    {/*            this.props.shotsMap,*/}
                    {/*            ({type}) => {*/}
                    {/*                switch (type) {*/}
                    {/*                    case 'hit':*/}
                    {/*                        return Styled.ShotHitCell;*/}
                    {/*                    case 'miss':*/}
                    {/*                        return Styled.ShotMissCell*/}
                    {/*                }*/}
                    {/*            },*/}
                    {/*        )*/}
                    {/*    }*/}
                    {/*</Styled.OpponentBoard>*/}
                    {
                        gameStatus === gameStatuses.initialServer &&
                        <RoomCreator/>
                    }

                    {
                        gameStatus === gameStatuses.shipPlacement &&
                        <>
                            <Styled.MyBoard>
                                {
                                    mapToGridShiftBy2(
                                        hoversGrid,
                                        () => Styled.HoverCell,
                                        (x, y) => eventsBus.emit(busEvents.placeShip, [x, y])
                                    )
                                }
                                {mapToGridShiftBy1(symbols, () => Styled.LetterCell)}
                                {mapShipsToGrid(this.props.playerShips)}
                            </Styled.MyBoard>
                            <ShipPlacementPanel/>
                        </>
                    }

                    {
                        gameStatus === gameStatuses.active &&
                        <>
                            <button
                                onClick={() => this.props.dispatch(setGameStatus(gameStatuses.initialServer))}>stop
                                game
                            </button>
                            <Styled.MyBoard>
                                {mapToGridShiftBy1(symbols, () => Styled.LetterCell)}
                                {
                                    mapToGridShiftBy2(
                                        this.props.opponentShotsMap,
                                        () => Styled.ShotMissCell
                                    )
                                }
                                {mapShipsToGrid(this.props.playerShips)}
                            </Styled.MyBoard>
                            <Styled.OpponentBoard>
                                {
                                    mapToGridShiftBy1(
                                        symbols,
                                        () => Styled.LetterCell,
                                    )
                                }
                                {
                                    mapToGridShiftBy2(
                                        hoversGrid,
                                        () => Styled.AimCell,
                                        this.shoot
                                    )
                                }
                                {
                                    mapToGridShiftBy2(
                                        this.props.shotsMap,
                                        ({type}) => {
                                            switch (type) {
                                                case 'hit':
                                                    return Styled.ShotHitCell;
                                                case 'miss':
                                                    return Styled.ShotMissCell
                                            }
                                        },
                                    )
                                }
                            </Styled.OpponentBoard>
                            <Styled.MoveIndicator shooter={iAmShooter}/>
                            <ShootTimer ref={this.timerInstanceRef} deadline={shootTime}/>
                        </>
                    }
                </Styled.Grid>
            </Styled.App>
        );
    }
}

App.propTypes = {
    dispatch: PropTypes.func.isRequired,
    playerShips: PropTypes.array.isRequired,
    gameStatus: PropTypes.number.isRequired,
    roomID: PropTypes.string,
    playerID: PropTypes.string,
    side: PropTypes.string,
    shotsMap: PropTypes.array.isRequired,
    opponentShotsMap: PropTypes.array.isRequired,
    iAmShooter: PropTypes.bool,
};

const mapStateToProps = state => ({
    playerShips: state.playerShips,
    phase: state.phase,
    gameStatus: getDeepProp(state, 'status.gameStatus'),
    roomID: getDeepProp(state, 'settings.roomID'),
    playerID: getDeepProp(state, 'settings.playerID'),
    side: getDeepProp(state, 'settings.side'),
    shotsMap: state.shotsMap,
    opponentShotsMap: state.opponentShotsMap,
    iAmShooter: state.iAmShooter,
});

export default connect(mapStateToProps)(App);
