import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";


//Utils
import {symbols, coordsGrid} from "./utils/lettersGrid";
import {
    eventsBus,
    mapShipsToGrid,
    getDeepProp,
    mapToGridShiftBy1,
    mapToGridShiftBy2,
    shotsMapAdapter
} from "./utils/functions";
import {gameStatuses, onEvents, busEvents} from "./utils/constants";
import {gameConnection} from "./utils/gameConnection";
import {soundsQueue} from './utils/soundsQueue';
import soundsBank from './sounds/soundsBank';

//Components
import * as Styled from './styled';
import ShootTimer from './components/Timer';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';
import OpponentDisconnectedModal from './components/OpponentDisconnectedModal';
import JoinRoomPage from './components/JoinRoomPage';
import ShipsPlacementPage from './components/ShipsPlacementPage';
import Modal from 'react-modal';


//Actions
import {
    setGameStatus,
    setRoomSettings,
    addShotToMap,
    addOpponentShotToMap,
    assignShooter,
    addPlayerShip,
    resetState,
    toggleOpponentDisconnectedModal,
    setRoomDestroyDeadline,
    updateOnlineRooms,
    setGameResult,
} from "./actions";
import {BasicShip} from "./utils/ships";

const customStyles = {
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, .6)'
    },
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)'
    }
};

Modal.setAppElement('#root');

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            shootTime: null,
            timerKey: Math.random(),
            modalIsOpen: false
        }
    }

    componentDidMount() {
        this.initConnection();

        // this.props.dispatch(addShotToMap([
        //     {
        //         shipID: 'miss',
        //         x: 1,
        //         y: 2,
        //         type: 'miss'
        //     },
        //     {
        //         shipID: 'miss',
        //         x: 3,
        //         y: 4,
        //         type: 'miss'
        //     }
        // ]))

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
                const {playerID, roomID, reconnect} = result;
                let gameStatus = reconnect ? gameStatuses.active : result.gameStatus;

                if (!playerID) {
                    throw new Error(`Wrong result after connection init`);
                }

                this.props.dispatch(setRoomSettings({playerID, roomID}));
                gameStatus && this.props.dispatch(setGameStatus(gameStatus));
            })
            .catch(({playerID}) => {
                this.leaveRoom({
                    settings: {playerID},
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
    get gameEvents() {
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
                eventHandler: ({deadline}) => {
                    if (!this.props.opponentDisconnectedModalOpen) {
                        this.props.dispatch(setRoomDestroyDeadline(deadline));
                        this.props.dispatch(toggleOpponentDisconnectedModal(true));
                    }
                }
            },
            {
                eventName: 'roomDestroyed',
                eventHandler: () => this.resetGameState()
            },
            {
                eventName: 'roomUpdated',
                eventHandler: roomsData => this.props.dispatch(updateOnlineRooms(roomsData))
            },
            {
                eventName: 'gameOver',
                eventHandler: ({stats}) => {
                    this.toggleModal(true);
                    this.props.dispatch(setGameResult(stats));
                }
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
        const {dispatch, opponentDisconnectedModalOpen} = this.props;
        dispatch(setGameStatus(gameStatuses.active));
        if (opponentDisconnectedModalOpen) {
            dispatch(toggleOpponentDisconnectedModal(false));
        }
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

                if (result.length) {
                    const shots = result.map(shot => {
                        const {x, y, type, shipID} = shot;
                        return {x, y, type, shipID};
                    });
                    this.playSoundType(shots[0].type);

                    this.props.dispatch(addShotToMap(shots));
                } else {
                    this.playSoundType('miss');
                    this.props.dispatch(addShotToMap([{
                        shipID: 'miss',
                        x,
                        y,
                        type: 'miss'
                    }]));
                }
            })
            .catch(e => console.error(e));
    };

    leaveRoom = (options = {}) => {
        gameConnection.emitLeaveRoom()
            .then(() => this.resetGameState(options))

    };

    resetGameState = (options = {}) => {
        window.history.pushState(null, 'Home', window.origin);

        this.setState({modalIsOpen: false});

        this.props.dispatch(resetState());

        this.props.dispatch(setRoomSettings({
            ...options.settings
        }));

        this.props.dispatch(setGameStatus(options.status || gameStatuses.initialServer))
    };

    playSoundType = type => {
        soundsQueue.volume = this.props.volume;
        soundsQueue.play(soundsBank.getRandomWithType(type));
    };

    toggleModal = open => {
        this.setState({
            modalIsOpen: open !== undefined ? open : !this.state.modalIsOpen
        });
    };

    endGameHandler = () => {
        this.toggleModal(false);
        this.leaveRoom();
    };

    render() {
        const
            {gameStatus, iAmShooter, gameResult} = this.props,
            {shootTime} = this.state;

        return (
            <Styled.App>
                <Styled.GlobalStyle/>

                <SettingsPanel/>

                <OpponentDisconnectedModal
                    onConfirmLeaveRoom={this.leaveRoom}
                />

                {
                    gameStatus === 123 &&
                    <JoinRoomPage/>
                }

                {
                    gameStatus === gameStatuses.initialServer &&
                    <ShipsPlacementPage/>
                }

                {
                    gameStatus !== gameStatuses.initialServer &&
                    <Styled.Grid>
                        {
                            gameStatus === gameStatuses.active &&
                            <>
                                {
                                    gameResult &&
                                    <Modal
                                        isOpen={this.state.modalIsOpen}
                                        onRequestClose={() => this.endGameHandler()}
                                        style={customStyles}
                                    >
                                        <h2>
                                            {
                                                gameResult.aliveShipsCount ?
                                                    'Поздравляем, вы выиграли!' :
                                                    'Сорян, вы проиграли'
                                            }
                                        </h2>
                                        <pre>{JSON.stringify(gameResult)}</pre>
                                    </Modal>
                                }
                                <button onClick={this.leaveRoom}>
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
                                            coordsGrid,
                                            () => Styled.AimCell,
                                            this.shoot
                                        )
                                    }
                                    {
                                        mapToGridShiftBy2(
                                            shotsMapAdapter(this.props.shotsMap),
                                            ({type}) => {

                                                switch (type) {
                                                    case 'hit':
                                                        return Styled.ShotHitCell;
                                                    case 'miss':
                                                        return Styled.ShotMissCell;
                                                    case 'kill':
                                                        return Styled.ShipDieCell;
                                                    default:
                                                        return props => <p>Ы</p>
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
                }
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

    shotsMap: PropTypes.object.isRequired,
    opponentShotsMap: PropTypes.array.isRequired,
    iAmShooter: PropTypes.bool,
    volume: PropTypes.number.isRequired,
    opponentDisconnectedModalOpen: PropTypes.bool.isRequired,
    gameResult: PropTypes.object,
};

const mapStateToProps = state => ({
    playerShips: state.playerShips,
    phase: state.phase,
    gameStatus: getDeepProp(state, 'status.gameStatus'),
    roomID: getDeepProp(state, 'settings.roomID'),
    playerID: getDeepProp(state, 'settings.playerID'),
    shotsMap: state.shotsMap,
    opponentShotsMap: state.opponentShotsMap,
    iAmShooter: state.iAmShooter,
    volume: state.volume,
    opponentDisconnectedModalOpen: state.opponentDisconnectedModalOpen,
    gameResult: state.gameResult
});

export default connect(mapStateToProps)(App);
