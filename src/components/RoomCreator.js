import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import {getDeepProp} from "../utils/functions";
import {gameConnection} from "../utils/gameConnection";

class RoomCreator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'Default',
            password: '',
            privateRoom: false
        }
    }

    handleSubmit = event => {
        event.preventDefault();
        gameConnection.createRoom(this.state, this.props.playerID)
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
        } else {
            this.setState({
                [event.target.name]: event.target.value
            })
        }
    };


    render() {
        return (
            <form onSubmit={this.handleSubmit}>

                <div className="form-group">
                    <input
                        name="name"
                        type="text"
                        className="form-control"
                        placeholder="Room name"
                        onChange={this.handleInputChange}
                    />
                </div>

                <div className="form-group form-check">
                    <input
                        name="privateRoom"
                        type="checkbox"
                        className="form-check-input"
                        id="isPrivateRoom"
                        checked={this.state.privateRoom}
                        onChange={this.handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="isPrivateRoom">Private room</label>
                </div>

                {
                    this.state.privateRoom &&
                    <div className="form-group">
                        <input
                            name="password"
                            type="password"
                            className="form-control"
                            placeholder="Password"
                            onChange={this.handleInputChange}
                        />
                    </div>
                }

                <button type="submit" className="btn btn-primary">Create</button>
            </form>
        );
    }
}

RoomCreator.propTypes = {
    playerID: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    playerID: getDeepProp(state, 'settings.playerID'),
});

export default connect(mapStateToProps)(RoomCreator);

