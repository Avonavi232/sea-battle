import axios from "axios";
import io from "socket.io-client";

import config from '../config';
import {emitEvents, gameSides, gameStatuses} from "./constants";
import {getDeepProp} from "./functions";
import {parse} from "query-string";

export default class GameConnection{
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.events = null;
        this.restoreGame = Function.prototype;
    }

    _initSocketConnection() {
        const socket = io(this.apiUrl);

        return new Promise(resolve => {
            socket.on('connect', () => {
                this.socket = socket;
                resolve(this.socket);
            })
        });
    }

    _subscribeSocketToEvents(){
        this.events.forEach(e => {
            if (!e.eventName || !e.eventHandler) {
                return;
            }

            this.socket.on(e.eventName, e.eventHandler)
        });

        return Promise.resolve();
    }

    _playerInit(playerID){
        return new Promise((resolve, reject) => {
            this.socket.emit(emitEvents.playerInit, {playerID}, success => {
                return success ? resolve(this.socket) : reject(new Error('playerInit returns false'))
            });
        })
    }

    _knockToRoom(roomID, reconnectingPlayerID){
        return new Promise ((resolve, reject) => {
            this.socket.emit(emitEvents.knockToRoom, {roomID, reconnectingPlayerID}, result => {
                if (getDeepProp(result, 'error')) {
                    reject(new Error(result.message))
                } else {
                    resolve(result);
                }
            })
        })
    }

    _restoreGameHistory = () => {
        try {
            return JSON.parse(localStorage.getItem(`game_save`));
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    createPlayer() {
        return axios.get(`${this.apiUrl}/create-player`)
            .then(({data}) => {
                if (!data.error && getDeepProp(data, 'data.playerID')) {
                    return data.data.playerID;
                } else {
                    throw new Error('create player request failed')
                }
            })
            .catch(e => console.error(e));
    }

    initConnection() {
        const
            {roomID} = parse(window.location.search),
            restored = this._restoreGameHistory();

        return this.createPlayer()
            .then(playerID => {
                if (restored) {
                    return this.connectToRoom({
                        roomID: restored.roomID,
                        playerID: playerID,
                        reconnectingPlayerID: restored.playerID,
                    });
                } else if (roomID) {
                    return this.connectToRoom({
                        roomID,
                        playerID,
                        side: gameSides.client,
                        gameStatus: gameStatuses.waitingClient
                    })
                } else {
                    return Promise.resolve({
                        playerID,
                        gameStatus: gameStatuses.initialServer,
                        side: gameSides.server
                    });
                }
            })
    }

    createRoom(settings, playerID) {
        return axios.post(`${this.apiUrl}/create-room`, { playerID, settings })
            .then(responce => responce.data)
            .then(({error, data}) => {
                if (error || !data.roomID) {
                    return Promise.reject(new Error('Create room failed'))
                } else {
                    return Promise.resolve(data.roomID);
                }
            })
            .catch(e => Promise.reject(e))
    }

    connectToRoom = ({roomID, playerID, reconnectingPlayerID, ...rest}) => {
        return this._initSocketConnection()
            .then(() => this._playerInit(playerID))
            .then(() => this._subscribeSocketToEvents())
            .then(() => this._knockToRoom(roomID, reconnectingPlayerID))
            .then(result => {
                result = {...result, ...rest};
                if (getDeepProp(result, 'reconnect')) {
                    this.restoreGame(result);
                }
                return result;
            })
    };

    emitPlacementDone(playerShips){
        this.socket.emit(emitEvents.placementDone, playerShips);
    }

    emitShot([x, y], resolve){
        this.socket.emit('shoot', [x, y], resolve);
    }
}

export const gameConnection = new GameConnection(config.apiUrl);