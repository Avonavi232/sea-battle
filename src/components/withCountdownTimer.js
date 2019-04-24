import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const withCountdownTimer = WrappedComponent => {
    class CountdownTimer extends Component {
        constructor(props) {
            super(props);

            this.state = {
                deadline: moment.duration(this.props.deadline)
            };

            this.intervalID = null;
        }

        componentDidMount() {
            this.init();
        }

        componentWillUnmount() {
            clearInterval(this.intervalID);
        }

        init(){
            this.intervalID = setInterval(() => {
                const newDuration = this.state.deadline.clone();

                if (this.state.deadline.seconds() > 0) {
                    newDuration.subtract(1, 's');
                } else {
                    clearInterval(this.intervalID);
                    return;
                }
                this.setState({deadline: newDuration});
            }, 1000);
        }

        toObject = duration => {
            return {
                seconds: duration.seconds(),
                minutes: duration.minutes(),
                hours: duration.hours(),
            }
        };

        render() {
            return <WrappedComponent {...this.props} timer={this.toObject(this.state.deadline)}/>
        }
    }

    CountdownTimer.propTypes = {
        deadline: PropTypes.number.isRequired,
    };

    return CountdownTimer;
};

export default withCountdownTimer;