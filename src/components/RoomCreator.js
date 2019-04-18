import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import {getDeepProp} from "../utils/functions";
import {gameConnection} from "../utils/gameConnection";
import {gameSides, gameStatuses} from "../utils/constants";
import {setGameStatus, setRoomSettings} from "../actions";

class RoomCreator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            maxScore: 3,
            chatEnable: true
        }
    }

    handleSubmit = event => {
        event.preventDefault();
        gameConnection.createRoom(this.state, this.props.playerID)
            .then(roomID => gameConnection.connectToRoom({roomID, playerID: this.props.playerID}))
            .then(responce => this.handleRoomEntered(responce))
            .catch(e => console.error(e))
    };

    handleRoomEntered = ({roomID, settings}) => {
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

    handleInputChange = event => {
        if (event.target.type === 'checkbox') {
            this.setState({
                [event.target.name]: event.target.checked
            })
        } else if (event.target.type === 'number') {
            this.setState({
                [event.target.name]: Number(event.target.value)
            })
        }
    };


    render() {
        return (
            <section className="startgame-form">
                <div className="container">
                    <form
                        className="startgame-form__form"
                        action="#"
                        onSubmit={this.handleSubmit}
                    >
                        <div className="startgame-form__item startgame-form__submit">
                            <button type="submit" className="button button_main">Get ready!</button>
                        </div>
                        <div className="startgame-form__item startgame-form__checkbox">
                            <label>
                                <input
                                    name="chatEnable"
                                    type="checkbox"
                                    checked={this.state.chatEnable}
                                    onChange={this.handleInputChange}
                                />
                                <span>Chat Enable</span>
                            </label>
                        </div>
                        <div className="startgame-form__item startgame-form__input">
                            <label>
                                <input
                                    value={this.state.maxScore}
                                    onChange={this.handleInputChange}
                                    name="maxScore"
                                    type="number"
                                />
                                <span>points play up to</span>
                            </label>
                        </div>
                    </form>
                </div>
            </section>
        );
    }
}

RoomCreator.propTypes = {
    playerID: PropTypes.string.isRequired,
    side: PropTypes.string,
};

const mapStateToProps = state => ({
    playerID: getDeepProp(state, 'settings.playerID'),
    side: getDeepProp(state, 'settings.side'),
});

export default connect(mapStateToProps)(RoomCreator);

