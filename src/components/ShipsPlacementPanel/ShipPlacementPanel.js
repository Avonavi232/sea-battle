import React, {Component} from 'react';
import styled from 'styled-components/macro';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import Switch from 'rc-switch';
import 'rc-switch/assets/index.css';

import * as ships from "../../utils/ships";
import * as Styled from "../../styled";
import {addPlayerShip, setCurrent, setNotPlacedShips} from "../../actions";
import config from '../../config';
import {between, eventsBus} from "../../utils/functions";
import {busEvents} from "../../utils/constants";
import {gameConnection} from "../../utils/gameConnection";

const Container = styled.div`
  display: grid;
  grid-template-rows: repeat(3, min-content);
  grid-gap: 2rem;
`;

const NotPlaced = styled.div`
  display: grid;
  grid-template-columns: min-content 1fr;
  grid-auto-rows: min-content;
  grid-gap: .5rem;
`;

const Ship = styled(({size, vertical, ...props}) => {
    return (
        <div {...props}>
            {
                [...Array(size)].map((e, i) => <Styled.ShipCell className="ship-cell" key={i}/>)
            }
        </div>
    )
})`
    display: flex;
    width: ${({size}) => `${size}em`};
    transition: transform .2s;
`;

const HoverShip = styled(Ship)`
    &:hover {
        cursor: pointer;
        transform: scale(1.1);
    }
`;

const CurrentShip = styled(Ship)`
  font-size: 30px;
  transform-origin: .5em .5em;
  transform: ${({vertical}) => vertical ? 'rotate(90deg)' : ''};
`;

const Panel = styled.div`
  display: grid;
  grid-template-columns: min-content 1fr;
  grid-gap: 1rem;
  align-items: center;
`;

const Title = styled.h2`
  font-weight: 300;
  font-size: 1.5rem;
  line-height: 1;
  margin-bottom: 0;
`;

const StyledSwitch = styled(Switch)`
  && {
    border: none;
    background-color: ${({theme}) => theme.inkColor};
  }
  &.rc-switch-checked {
    border: none;
    background-color: ${({theme}) => theme.greenInkColor};
  }
`;

const SwitchContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, min-content);
  align-items: center;
  grid-gap: .5rem;
`;

class ShipPlacementPanel extends Component {
    componentDidMount() {
        const {dispatch} = this.props;

        const shipsToPlace = {
            // single: [1, 1, 1, 1].map(() => new ships.SingleShip(null, dispatch)),
            // double: [1, 1, 1].map(() => new ships.DoubleShip(null, dispatch)),
            // triple: [1, 1].map(() => new ships.TripleShip(null, dispatch)),
            quadruple: [1].map(() => new ships.QuadrupleShip(null, dispatch)),
        };

        dispatch(setNotPlacedShips(shipsToPlace));

        this.unsubscribe = eventsBus.subscribe(
            busEvents.placeShip,
            (x, y) => this.placeShip(x, y, Number(this.props.currentDirection))
        );

        const nextNotPlaced = this.getNextNotPlaced(shipsToPlace);

        if (nextNotPlaced) {
            dispatch(setCurrent(nextNotPlaced));
        }
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    setCurrent = type => {
        const target = this.props.notPlacedShips[type][0];
        if (target) {
            this.props.dispatch(setCurrent(target))
        }
    };

    getNextNotPlaced = ships => {
        const keys = Object.keys(ships);

        for (let i = 0; i < keys.length; i++) {
            if (ships[keys[i]][0]) {
                return ships[keys[i]][0]
            }
        }

        return null;
    };

    placeShip = (x, y, direction) => {
        const {dispatch, playerShips} = this.props;

        if (
            !between(x, -1, config.boardSize)
            || !between(y, -1, config.boardSize)
        ) {
            return;
        }

        const ship = this.props.current;
        ship.pos = {
            x,
            y,
            direction
        };

        const cache = {...this.props.notPlacedShips};

        for (let key in cache) {
            let index = cache[key].indexOf(ship);

            if (index !== -1) {
                const clone = cache[key].slice();
                clone.splice(index, 1);
                cache[key] = clone;
                break;
            }
        }

        const nextNotPlaced = this.getNextNotPlaced(cache);

        if (nextNotPlaced) {
            dispatch(setCurrent(nextNotPlaced));
        } else {
            dispatch(setCurrent(null));

            gameConnection.emitPlacementDone([].concat(playerShips, ship));
        }

        dispatch(setNotPlacedShips(cache));
        dispatch(addPlayerShip(ship));
    };


    render() {
        const {notPlacedShips, current} = this.props;

        return (
            <Container>
                <Title>Your Navy!</Title>
                <NotPlaced>
                    {
                        notPlacedShips.single &&
                        <>
                            <span>{notPlacedShips.single.length}x</span>
                            <HoverShip onClick={() => this.setCurrent('single')} size={1}/>
                        </>
                    }

                    {
                        notPlacedShips.double &&
                        <>
                            <span>{notPlacedShips.double.length}x</span>
                            <HoverShip onClick={() => this.setCurrent('double')} size={2}/>
                        </>
                    }

                    {
                        notPlacedShips.triple &&
                        <>
                            <span>{notPlacedShips.triple.length}x</span>
                            <HoverShip onClick={() => this.setCurrent('triple')} size={3}/>
                        </>
                    }

                    {
                        notPlacedShips.quadruple &&
                        <>
                            <span>{notPlacedShips.quadruple.length}x</span>
                            <HoverShip onClick={() => this.setCurrent('quadruple')} size={4}/>
                        </>
                    }
                </NotPlaced>

                {
                    current ?
                        <Panel>
                            <CurrentShip
                                size={current.length}
                                vertical={this.props.currentDirection === '1'}
                            />
                            <SwitchContainer>
                                <span>horizontal</span>
                                <StyledSwitch
                                    onChange={value => this.props.onChangeHandler({
                                        target: {
                                            name: 'direction',
                                            value: value ? '1' : '0'
                                        }
                                    })}
                                />
                                <span>vertical</span>
                            </SwitchContainer>
                        </Panel>
                        :
                        null
                }
            </Container>
        );
    }
}

ShipPlacementPanel.propTypes = {
    dispatch: PropTypes.func.isRequired,
    notPlacedShips: PropTypes.object.isRequired,
    current: PropTypes.object,
    playerShips: PropTypes.array,
    onChangeHandler: PropTypes.func.isRequired,
    currentDirection: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    playerShips: state.playerShips,
    notPlacedShips: state.notPlacedShips,
    current: state.current,
});

export default connect(mapStateToProps)(ShipPlacementPanel);