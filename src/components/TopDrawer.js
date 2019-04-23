import React, {Component} from 'react';
import ReactDOM from 'react-dom';
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
  z-index: 1000;
`;


const Opener = styled.button`
  position: fixed;
  top: 10px;
  right: 10px;
  border: none;
  background-color: transparent;
  padding: 5px;
  z-index: 1001;
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
        };


        this.outerRef = React.createRef();
        this.innerRef = React.createRef();

        this.Inner = styled(this.props.Inner)`
          position: absolute;
          left: 50%;
          top: 0;
          transition: all .3s;
        `;
    }

    static get transforms(){
        return {
            closed: 'translateX(-50%) translateY(-100%)',
            opened: 'translateX(-50%) translateY(0)',
        }
    }


    toggleOpen = open => {
        this.setState({
            opened: open !== undefined ? open : !this.state.opened,
            shown: open === true || !this.state.opened === true || this.state.shown
        }, () => this.transition(this.state.opened));
    };

    transition = (opened) => {
        const
            {current: outer} = this.outerRef,
            {current: inner} = this.innerRef;

        if (opened) {
            outer.style.opacity = 0;
            outer.style.display = 'block';
            inner.style.transform = TopDrawer.transforms.closed;
            requestAnimationFrame(() => requestAnimationFrame(() => {
                outer.style.opacity = 1;
                inner.style.transform = TopDrawer.transforms.opened;
            }))
        } else {
            inner.style.transform = TopDrawer.transforms.closed;
        }
    };

    toggleShown = () => {
        if (!this.state.opened) {
            this.setState({shown: false});
        }
    };

    render() {
        const
            {opened, shown} = this.state,
            {Inner} = this;

        return ReactDOM.createPortal(
            <>
                {
                    shown &&
                    <Outer opened={opened} ref={this.outerRef} onClick={() => this.toggleOpen(false)}>
                        <Inner
                            ref={this.innerRef}
                            opened={opened}
                            onTransitionEnd={debounce(() => this.toggleShown(), 100)}
                            onClick={e => e.stopPropagation()}
                        >
                            {this.props.children}
                        </Inner>
                    </Outer>
                }

                <Opener opened={opened} onClick={() => this.toggleOpen()}>
                    <SettingsIcon/>
                </Opener>
            </>,
            document.querySelector('#root')
        );
    }
}


export default TopDrawer;