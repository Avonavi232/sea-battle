import React, {useState} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components/macro";
import {ReactComponent as VolumeOnIcon} from "../../img/volume-on.svg";
import {ReactComponent as VolumeOffIcon} from "../../img/volume-off.svg";
import {debounce} from "../../utils/functions";

const VolumeButton = styled(({volume, ...props}) => {
    return (
        <div {...props}>
            {
                volume ? <VolumeOnIcon/> : <VolumeOffIcon/>
            }
        </div>
    )
})`
  width: 35px;
  height: 35px;
  &:hover {
    cursor: pointer;
  }
  svg {
    width: 100%;
    height: 100%;
    path {
      fill: ${({volume}) => volume ? '#8187ff' : '#ff7172'}
    }
  }
`;



const VolumeSetting = props => {
    const
        [inputVolume, setInputVolume] = useState(0.5),
        [volumeMemo, setVolumeMemo] = useState(null);


    const volumeChangeHandler = debounce(value => {
        props.update(value / 100);
    }, 100);


    const volumeButtonClickHandler = () => {
        if (inputVolume) {
            setInputVolume(0);
            setVolumeMemo(inputVolume);
            props.update(0);
        } else {
            setInputVolume(volumeMemo);
            props.update(volumeMemo);
        }
    };


    return (
        <>
            <VolumeButton
                volume={props.volume}
                onClick={volumeButtonClickHandler}
            />
            <input
                type="range"
                min="0"
                max="100"
                onChange={e => {
                    e.persist();
                    setInputVolume(e.target.value / 100);
                    volumeChangeHandler(e.target.value);
                }}
                value={inputVolume * 100}
            />
        </>
    );
};

VolumeSetting.propTypes = {
    volume: PropTypes.number.isRequired,
    update: PropTypes.func.isRequired,
};

export default VolumeSetting;