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

//Components
import * as Styled from './styled';
import ShipPlacementPanel from './ShipPlacementPanel';
import {SocketContext} from "./utils/withSocket";
import RoomCreator from './components/RoomCreator';
import ShootTimer from './components/Timer';

//Actions
import {
    setGameStatus,
    setRoomSettings,
    restoreMatchesArchive,
    addShotToMap,
    addOpponentShotToMap,
    assignShooter
} from "./actions";


class App extends Component {
    constructor(props) {
        super(props);

        this.timerInstanceRef = createRef();
        this.state = {
            shootTime: null
        }
    }


    componentDidMount() {
        this.init();

        // const ship1 = new ships.TripleShip({x: 0, y: 1, direction: true}, this.props.dispatch);
        // const ship2 = new ships.TripleShip({x: 5, y: 5, direction: false}, this.props.dispatch);
        //
        // axios.post(`${config.apiUrl}/create-ships-map`, {ships: [ship1, ship2]});

        /*Перед уходом из игры (релоад, выгрузка) сохраняем стейт*/
        window.addEventListener('beforeunload', this.saveGameHistory);
    }

    componentWillUnmount() {
        this.saveGameHistory();
    }

    init() {
        const
            {dispatch} = this.props,
            {roomID} = parse(window.location.search),
            settings = {},
            restored = this.restoreGameHistory();

        let gameStatus;

        App.createPlayer()
            .then(({error, data}) => {
                if (error || !data.playerID) {
                    return Promise.reject(new Error('Create player failed'))
                }

                if (restored === 123123) {
                    settings.playerID = restored.playerID;

                    this.reconnectToRoom({
                        roomID: restored.roomID,
                        playerID: data.playerID,
                        reconnectingPlayerID: restored.playerID,
                    })
                } else if (roomID) {
                    settings.side = gameSides.client;
                    settings.playerID = data.playerID;
                    gameStatus = gameStatuses.waitingClient;
                    this.connectToRoom({roomID, playerID: settings.playerID})
                } else {
                    settings.side = gameSides.server;
                    settings.playerID = data.playerID;
                    gameStatus = gameStatuses.initialServer;
                }

                dispatch(setRoomSettings(settings));
                dispatch(setGameStatus(gameStatus));
            })
            .catch(e => {
                console.error(e);
                dispatch(setGameStatus(gameStatuses.connectError))
            })
    }

    static createPlayer() {
        return axios.get(`${config.apiUrl}/create-player`)
            .then(responce => responce.data);
    }

    _playerSocketInit(playerID) {
        this.socket = io(config.apiUrl);

        return new Promise((resolve, reject) => {
            this.socket.on('connect', () => {
                this.socket.emit(emitEvents.playerInit, {playerID}, success => {
                    return success ? resolve(this.socket) : reject(new Error('playerInit returns false'))
                });
            })
        });
    }

    createRoom(settings) {
        return axios.post(`${config.apiUrl}/create-room`, {
            playerID: this.props.playerID,
            settings
        })
            .then(responce => responce.data)
            .then(({error, data}) => {
                if (error || !data.roomID) {
                    return Promise.reject(new Error('Create room failed'))
                } else {
                    this.props.dispatch(setRoomSettings({roomID: data.roomID}));

                    return Promise.resolve(data);
                }
            })
    }

    connectToRoom = ({roomID, playerID}) => {
        this._playerSocketInit(playerID)
            .then(socket => {
                this._subscribeToSocketEvents(socket);
                socket.emit(emitEvents.knockToRoom, {roomID})
            })
            .catch((e) => console.error(e));
    };

    reconnectToRoom({roomID, playerID, reconnectingPlayerID}) {
        this._playerSocketInit(playerID)
            .then(socket => {
                this._subscribeToSocketEvents(socket);
                socket.emit(emitEvents.knockToRoom, {roomID, reconnectingPlayerID})
            })
            .catch((e) => console.error(e));
    }

    /*Сохранение/восстановление истории матча*/
    saveGameHistory = () => {
        if (this.props.gameStatus === gameStatuses.active) {
            localStorage.setItem(
                `game_save`,
                JSON.stringify({
                    history: this.props.history,
                    playerID: this.props.playerID,
                    roomID: this.props.roomID
                })
            );
        } else {
            localStorage.removeItem(`game_save`);
        }
    };

    restoreGameHistory = () => {
        try {
            const save = JSON.parse(localStorage.getItem(`game_save`));
            if (save && save.history) {
                this.props.dispatch(restoreMatchesArchive(save.history));
                this.props.dispatch(setRoomSettings({
                    playerID: save.playerID,
                    roomID: save.roomID
                }));
            }
            return save;
        } catch (e) {
            console.error(e);
            return false;
        }
    };


    /*Socket.io events*/
    _subscribeToSocketEvents = socket => {
        //Default events
        // socket.on(onEvents.connectError, this.connectErrorHandler);
        // socket.on(onEvents.reconnect, this.socketReconnectHandler);

        //Custom events
        socket.on(onEvents.roomEntered, this.roomEnteredHandler);
        socket.on(onEvents.startShipsPlacement, this.startShipPlacementHandler);
        socket.on(onEvents.startGame, this.startGameHandler);
        socket.on(onEvents.opponentShoot, this.opponentShootHandler);
        socket.on(onEvents.chatMessage, this.receiveChatMessageHandler);
        socket.on(onEvents.assignShooter, this.assignShooterHandler);
    };

    roomEnteredHandler = ({roomID, settings}) => {
        const {dispatch, side} = this.props;
        let status;


        settings.roomUrl = `${window.location.origin}/?roomID=${roomID}`;
        settings.roomID = roomID;

        if (side === gameSides.server) {
            status = gameStatuses.waitingServer;
            window.history.pushState(null, 'RoomName', settings.roomUrl);
        }

        dispatch(setRoomSettings(settings));
        status && dispatch(setGameStatus(status));
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

    placementDoneHandler = ({playerShips}) => {
        this.socket.emit(emitEvents.placementDone, playerShips);
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
        new Promise(resolve => {
            this.socket.emit('shoot', [x, y], resolve);
        })
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
            <SocketContext.Provider value={this.socket}>
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
                            <RoomCreator
                                createRoom={this.createRoom.bind(this)}
                                connectToRoom={this.connectToRoom}
                            />
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
                                <ShipPlacementPanel
                                    onPlacementDone={this.placementDoneHandler}
                                />
                            </>
                        }

                        {
                            gameStatus === gameStatuses.active &&
                            <>
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
            </SocketContext.Provider>
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
