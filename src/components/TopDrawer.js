import React, {Component} from 'react';
import styled from 'styled-components/macro';
import {ReactComponent as SettingsIcon} from '../img/settings.svg';
import {debounce} from "../utils/functions";

const Outer = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  transition: all .3s;
  background-color: ${({opened}) => opened ? 'rgba(0, 0, 0, .7)' : 'transparent'};
`;

const Inner = styled(props => <div {...props}/>).attrs(props => ({
    style: {
        transform: `translateX(-50%)${props.opened ? '' : 'translateY(-100%)'}`
    }
}))`
  width: 300px;
  height: 150px;
  background-color: #ff8787;
  position: absolute;
  left: 50%;
  top: 0;
  transition: all .3s;
`;

const Opener = styled.button`
  position: fixed;
  top: 10px;
  right: 10px;
  border: none;
  background-color: transparent;
  padding: 5px;
  &:focus {
    outline: none;
  }
  &:hover {
    cursor: pointer;
  }
  
  svg {
    width: 30px;
    height: 30px;
    display: block;
    path {
      transition: all .7s;
      fill: ${({opened}) => opened ? '#b6bcff' : '#4467ff'}
    }
  }
`;

class TopDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opened: false,
            shown: false
        }
    }

    toggleOpen = open => {
        this.setState({
            opened: open !== undefined ? open : !this.state.opened,
            shown: open === true || !this.state.opened === true || this.state.shown
        });
    };

    toggleShown = () => {
        if (this.state.shown) {
            this.setState({ shown: false });
        }
    };


    render() {
        const {opened, shown} = this.state;

        return (
            <>
                {
                    shown &&
                    <Outer opened={opened}>
                        <Inner opened={opened} onTransitionEnd={debounce(() => this.toggleShown(), 100)}>
                            {this.props.children}
                        </Inner>
                    </Outer>
                }

                <Opener opened={opened} onClick={() => this.toggleOpen()}>
                    <SettingsIcon/>
                </Opener>
            </>
        );
    }
}


export default TopDrawer;