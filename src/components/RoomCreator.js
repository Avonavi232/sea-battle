import React, {Component} from 'react';

//Redux
import {connect} from 'react-redux';
import {getDeepProp} from "../utils/functions";

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
        this.props.createRoom(this.state)
            .then(({roomID}) => this.props.connectToRoom({roomID, playerID: this.props.playerID}))
            .catch(e => console.error(e))
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

const mapStateToProps = state => ({
    playerID: getDeepProp(state, 'settings.playerID'),
});

export default connect(mapStateToProps)(RoomCreator);

