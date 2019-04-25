import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import styled from 'styled-components/macro';
import {connect} from "react-redux";

import paper from '../img/paper.jpg';
import withCountdownTimer from './withCountdownTimer';


const customStyles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        position: "static",
        border: 'none',
        backgroundImage: `url("${paper}")`,
        backgroundSize: '100%',
        overflow: "hidden",
        borderRadius: "4px",
        padding: "20px"
    }
};
Modal.setAppElement('#root');

const StyledTimer = styled(({timer, ...props}) => {
    return (
        <div {...props}>
            <span>{timer.minutes}</span>
            :
            <span>{timer.seconds}</span>
        </div>
    )
})`
  display: inline-block;
  font-weight: normal;
`;

const Timer = withCountdownTimer(StyledTimer);

const OpponentDisconnectedModal = props => {
    return (
        <Modal
            isOpen={props.opponentDisconnectedModalOpen}
            style={customStyles}
        >
            <h2>Opponent is disconnected</h2>
            <h3>Room will be removed after:
                {
                    props.roomDestroyDeadline && <Timer deadline={props.roomDestroyDeadline}/>
                }
            </h3>
            <button onClick={props.onConfirmLeaveRoom}>Leave room</button>
        </Modal>
    );
};

OpponentDisconnectedModal.propTypes = {
    onConfirmLeaveRoom: PropTypes.func.isRequired,
    opponentDisconnectedModalOpen: PropTypes.bool.isRequired,
    roomDestroyDeadline: PropTypes.number,
};

const mapStateToProps = state => ({
    opponentDisconnectedModalOpen: state.opponentDisconnectedModalOpen,
    roomDestroyDeadline: state.roomDestroyDeadline
});

export default connect(mapStateToProps)(OpponentDisconnectedModal);