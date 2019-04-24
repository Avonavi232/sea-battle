import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import styled from 'styled-components/macro';

import TopDrawer from '../TopDrawer';
import {setVolume} from "../../actions";
import paper from "../../img/paper.jpg";
import VolumeSetting from './VolumeSetting';

const DrawerInner = styled.div`
  padding: 1rem;
  background-image: url("${paper}");
  background-size: 100%;
  border-radius: 0 0 5px 5px;
  display: grid;
  grid-template-columns: min-content auto;
  align-items: center;
  grid-gap: 1rem;
`;

class SettingsPanel extends Component {
    render() {
        return (
            <TopDrawer Inner={DrawerInner}>
                <VolumeSetting
                    volume={this.props.volume}
                    update={volume => this.props.dispatch(setVolume(volume))}
                />
            </TopDrawer>
        );
    }
}

SettingsPanel.propTypes = {
    dispatch: PropTypes.func.isRequired,
    volume: PropTypes.number.isRequired,
};

const mapStateToProps = state => ({
    volume: state.volume
});

export default connect(mapStateToProps)(SettingsPanel);