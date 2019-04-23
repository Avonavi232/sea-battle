import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import styled from "styled-components";


class Timer extends Component {
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

    render() {
        const {deadline} = this.state;
        return (
            <div className={this.props.className}>
                {deadline.minutes()}
                :
                {deadline.seconds()}
            </div>
        );
    }
}

export const StyledTimer = styled(Timer)`
  grid-area: moveTimer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36px;
  font-weight: 300;
    @media all and (max-width: 768px) {
        font-size: 26px; 
    }
`;

StyledTimer.propTypes = {
    deadline: PropTypes.number.isRequired,
};

export default StyledTimer;