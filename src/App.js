import React, {Component, createRef} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
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
import {gameStatuses, onEvents, busEvents, gameSides} from "./utils/constants";
import {gameConnection} from "./utils/gameConnection";
import {soundsQueue} from './utils/soundsQueue';
import soundsBank from './sounds/soundsBank';

//Components
import * as Styled from './styled';
import ShipPlacementPanel from './components/ShipsPlacementPanel';
import RoomCreator from './components/RoomCreator';
import ShootTimer from './components/Timer';

//Actions
import {
    setGameStatus,
    setRoomSettings,
    addShotToMap,
    addOpponentShotToMap,
    assignShooter,
    addPlayerShip,
    resetState
} from "./actions";
import {BasicShip} from "./utils/ships";


class App extends Component {
    constructor(props) {
        super(props);

        this.timerInstanceRef = createRef();
        this.state = {
            shootTime: null,
            timerKey: Math.random()
        }
    }

    componentDidMount() {
        this.initConnection();

        /*Перед уходом из игры (релоад, выгрузка) сохраняем стейт*/
        window.addEventListener('beforeunload', this.saveGameSettings);
    }

    componentWillUnmount() {
        this.saveGameSettings();
    }

    initConnection() {
        gameConnection.events = this.gameEvents;
        gameConnection.restoreGame = this.restoreGame;

        gameConnection.initConnection()
            .then(result => {
                const {playerID, side, roomID, reconnect} = result;
                let gameStatus = reconnect ? gameStatuses.active : result.gameStatus;

                if (!playerID) {
                    throw new Error(`Wrong result after connection init`);
                }

                this.props.dispatch(setRoomSettings({playerID, side, roomID}));
                gameStatus && this.props.dispatch(setGameStatus(gameStatus));
            })
            .catch(({playerID, side}) => {
                this.resetGame({
                    settings: { playerID, side },
                    status: gameStatuses.initialServer
                });
            })
    }

    /*Сохранение/восстановление*/
    saveGameSettings = () => {
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

    restoreGame = data => {
        const
            shipsMap = data.shipsMap.ships,
            {opponentShotsMap, playerShotsMap, roomID, playerID} = data,
            {dispatch} = this.props;


        dispatch(addOpponentShotToMap(opponentShotsMap));
        dispatch(addShotToMap(playerShotsMap));
        dispatch(setRoomSettings({roomID, playerID}));

        shipsMap
            .map(shipData => BasicShip.recreate(shipData, dispatch))
            .forEach(ship => this.props.dispatch(addPlayerShip(ship)));
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
                eventName: onEvents.assignShooter,
                eventHandler: this.assignShooterHandler
            },
            {
                eventName: 'opponentDisconnect',
                eventHandler: () => console.log('opponentDisconnect')
            },
            {
                eventName: 'opponentReconnect',
                eventHandler: () => console.log('opponentReconnect')
            },
            {
                eventName: 'roomDestroyed',
                eventHandler: () => console.log('roomDestroyed')
            }
        ]
    };

    startShipPlacementHandler = () => {
        this.props.dispatch(setGameStatus(gameStatuses.shipPlacement));
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
        this.setState({
            shootTime,
            timerKey: Math.random()
        });
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
                    this.playSoundType('hit');
                    shot.type = 'hit';
                } else if (result === 'miss') {
                    this.playSoundType('miss');
                    shot.type = 'miss';
                } else if (result === 'kill') {
                    // this.playSoundType('kill');
                    shot.type = 'kill';
                }
                this.props.dispatch(addShotToMap(shot));
            })
            .catch(e => console.error(e));
    };

    resetGame = ({settings, status}) => {
        window.history.pushState(null, 'Home', window.origin);
        this.props.dispatch(resetState());

        this.props.dispatch(setRoomSettings({
            roomID: null,
            roomUrl: null,
            side: gameSides.server,
            ...settings
        }));
        this.props.dispatch(setGameStatus(status || gameStatuses.initialServer))
    };

    playSoundType = type => {
      soundsQueue.play(soundsBank.getRandomWithType(type));
    };

    render() {
        const {gameStatus, iAmShooter} = this.props;
        const {shootTime} = this.state;

        return (
            <Styled.App>
                <Styled.GlobalStyle/>
                <Styled.Grid>
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
                                        () => Styled.ShipPlacementCell,
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
                            <button onClick={this.resetGame}>
                                stop game
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
                                                    return Styled.ShotMissCell;

                                                case 'kill':
                                                default: return Styled.ShotHitCell
                                            }
                                        },
                                    )
                                }
                            </Styled.OpponentBoard>
                            <Styled.MoveIndicator shooter={iAmShooter}/>
                            {
                                shootTime &&
                                    <ShootTimer key={this.state.timerKey} deadline={shootTime}/>
                            }
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
