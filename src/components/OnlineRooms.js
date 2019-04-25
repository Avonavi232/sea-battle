import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import styled from 'styled-components/macro';
import {getDeepProp} from "../utils/functions";
import {gameConnection} from "../utils/gameConnection";
import {gameSides, gameStatuses} from "../utils/constants";
import {resetState, setGameStatus, setRoomSettings} from "../actions";

const Container = styled.div`
  border: 1px solid red;
  padding: 1rem;
  width: 60vw;
`;

const RoomsTable = styled.table`
  width: 100%;
  text-align: center;
`;

class OnlineRooms extends Component {
    knockToRoomHandler = (connectionData, isProtected) => {
        if (isProtected) {
            connectionData.password = prompt("Для доступа к комнате введи пароль");
        }

        gameConnection.connectToRoom(connectionData)
            .then(res => this.roomEnteredHandler(res))
            .catch(e => console.error(e));
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

    leaveRoomHandler = () => {
        gameConnection.emitLeaveRoom()
            .then(() => {
                window.history.pushState(null, 'Home', window.origin);

                this.props.dispatch(resetState());

                this.props.dispatch(setRoomSettings({
                    side: gameSides.server
                }));

                this.props.dispatch(setGameStatus(gameStatuses.initialServer))
            });
    };

    leaveRoomButton = () => {
        return (
            <button onClick={() => this.leaveRoomHandler()} >
                Вы здесь. Выйти
            </button>
        )
    };

    knockToRoomButton = (roomID, playerID, isProtected) => {
        const connectionData = { roomID, playerID };

        return (
            <button onClick={() => this.knockToRoomHandler(connectionData, isProtected)} >
                Войти
            </button>
        )
    };

    getRoomsLayout = roomsData => {
        const {dispatch, roomID, playerID} = this.props;

        return Object.values(roomsData).map(roomData => {
            return (
                <tr key={roomData.roomID}>
                    <td>{roomData.name}</td>
                    <td>{!!roomData.protected ? '+' : '-'}</td>
                    <td>{roomData.online}/{roomData.size}</td>
                    <td>
                        {
                            roomID ?
                                roomID === roomData.roomID ?
                                    this.leaveRoomButton() :
                                    null :
                                this.knockToRoomButton(roomData.roomID, playerID, roomData.protected)
                        }
                    </td>
                </tr>
            )
        })
    };

    render() {
        const {onlineRooms} = this.props;

        return (
            <Container>
                <h2>Online Rooms</h2>
                <RoomsTable>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Protected</th>
                        <th>Online</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.getRoomsLayout(onlineRooms)
                    }
                    </tbody>
                </RoomsTable>
            </Container>
        );
    }
}

OnlineRooms.propTypes = {
    dispatch: PropTypes.func.isRequired,
    roomID: PropTypes.string,
    playerID: PropTypes.string,
    onlineRooms: PropTypes.objectOf(PropTypes.shape({
        roomID: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        protected: PropTypes.bool.isRequired,
        online: PropTypes.number.isRequired,
        size: PropTypes.number.isRequired,
    })),
};

const mapStateToProps = state => ({
    onlineRooms: state.onlineRooms,
    roomID: getDeepProp(state, 'settings.roomID'),
    playerID: getDeepProp(state, 'settings.playerID'),
});

export default connect(mapStateToProps)(OnlineRooms);