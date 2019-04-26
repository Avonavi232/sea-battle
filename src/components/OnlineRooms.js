import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import styled from 'styled-components/macro';
import {getDeepProp} from "../utils/functions";
import {gameConnection} from "../utils/gameConnection";
import {gameStatuses} from "../utils/constants";
import {resetState, setGameStatus, setRoomSettings} from "../actions";
import {ReactComponent as LockedIcon} from '../img/locked.svg';
import {ReactComponent as UnlockedIcon} from '../img/unlocked.svg';

const RoomsTable = styled.table`
  width: 100%;
  text-align: center;
`;

const VerticalAligned = styled.span`
  display: inline-block;
  vertical-align: middle;
`;

const StyledPrivateIcon = styled(({isPrivate, ...props}) => {
    const Component = isPrivate ? LockedIcon : UnlockedIcon;
    return <Component {...props}/>
})`
  width: 15px;
  height: 15px;
  display: inline-block;
  vertical-align: middle;
  margin-right: .5rem;
 
  path {
    fill: ${({isPrivate}) => isPrivate ? '#da3545' : '#28a645'};
  }
`;

const Col = styled(({width, ...props}) => <th {...props}/>)`
  width: ${({width}) => width};
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
        const {dispatch} = this.props;
        let status;

        settings.roomUrl = `${window.location.origin}/?roomID=${roomID}`;
        settings.roomID = roomID;

        dispatch(setRoomSettings(settings));
        status && dispatch(setGameStatus(status));
    };

    leaveRoomHandler = () => {
        gameConnection.emitLeaveRoom()
            .then(() => {
                window.history.pushState(null, 'Home', window.origin);

                this.props.dispatch(resetState());

                this.props.dispatch(setGameStatus(gameStatuses.initialServer))
            });
    };

    leaveRoomButton = () => {
        return (
            <button type="button" className="btn btn-primary" onClick={() => this.leaveRoomHandler()} >
                Вы здесь. Выйти
            </button>
        )
    };

    knockToRoomButton = (roomID, playerID, isProtected) => {
        const connectionData = { roomID, playerID };
        return (
            <button type="button" className="btn btn-primary" onClick={() => this.knockToRoomHandler(connectionData, isProtected)} >
                Войти
            </button>
        )
    };

    getRoomsRowsLayout = roomsData => {
        const {roomID, playerID} = this.props;

        return Object.values(roomsData).map(roomData => {
            return (
                <tr key={roomData.roomID}>
                    <td>
                        <StyledPrivateIcon isPrivate={!!roomData.protected}/>
                        <VerticalAligned>{roomData.name}</VerticalAligned>
                    </td>
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
            <RoomsTable className={this.props.className + ' table'}>
                <thead>
                <tr>
                    <Col width="25%" scope="col">Room</Col>
                    <Col width="25%" scope="col">Online</Col>
                    <Col width="50%" scope="col">Actions</Col>
                </tr>
                </thead>
                <tbody>
                {
                    this.getRoomsRowsLayout(onlineRooms)
                }
                </tbody>
            </RoomsTable>
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