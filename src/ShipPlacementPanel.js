import React, {Component} from 'react';
import styled from 'styled-components/macro';
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import * as ships from "./utils/ships";
import {cellBg} from "./styled";
import {addPlayerShip, setCurrent, setNotPlacedShips} from "./actions";
import config from './config';
import {between, eventsBus} from "./utils/functions";
import {busEvents} from "./utils/constants";
import {gameConnection} from "./utils/gameConnection";

const StyledPhase1 = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-area: OpponentBoard;
  
  border: 1px solid red;
  padding: 1rem;
`;

const Cache = styled.div`
  display: grid;
  grid-template-columns: min-content 1fr;
  grid-auto-rows: min-content;
  grid-gap: 1rem;
`;

const Ship = styled(({size, ...props}) => <div {...props}/>)`
  font-size: 20px;
  width: ${({size}) => `${size}em`};
  height: 1em;
  ${cellBg()}
  &:hover {
    cursor: pointer;
  }
`;

const Current = styled(Ship)`
  font-size: 30px;
  &:hover {
    cursor: default;
  }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: min-content;
  grid-gap: .3rem 1rem;
`;

class ShipPlacementPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            form: {
                x: 0,
                y: 0,
                direction: '0'
            }
        }
    }


    componentDidMount() {
        const {dispatch} = this.props;

        dispatch(setNotPlacedShips({
            // single: [1, 1, 1, 1].map(() => new ships.SingleShip(null, dispatch)),
            // double: [1, 1, 1].map(() => new ships.DoubleShip(null, dispatch)),
            // triple: [1, 1].map(() => new ships.TripleShip(null, dispatch)),
            quadruple: [1].map(() => new ships.QuadrupleShip(null, dispatch)),
        }));

        this.unsubscribe = eventsBus.subscribe(
            busEvents.placeShip,
            (x, y) => this.placeShip(x, y, Number(this.state.form.direction))
        );
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

    onChangeHandler = ({target}) => {
        this.setState({
            form: {
                ...this.state.form,
                [target.name]: target.value
            }
        })
    };

    onSubmitHandler = (event) => {
        event.preventDefault();
        const
            x =  Number(this.state.form.x),
            y =  Number(this.state.form.y),
            direction = Number(this.state.form.direction);

        this.placeShip(x, y, direction)
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

            if(index !== -1) {
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
            <StyledPhase1>
                <Cache>
                    {
                        notPlacedShips.single &&
                        <>
                            <span>{notPlacedShips.single.length}x</span>
                            <Ship onClick={() => this.setCurrent('single')} size={1}/>
                        </>
                    }

                    {
                        notPlacedShips.double &&
                        <>
                            <span>{notPlacedShips.double.length}x</span>
                            <Ship onClick={() => this.setCurrent('double')} size={2}/>
                        </>
                    }

                    {
                        notPlacedShips.triple &&
                        <>
                            <span>{notPlacedShips.triple.length}x</span>
                            <Ship onClick={() => this.setCurrent('triple')} size={3}/>
                        </>
                    }

                    {
                        notPlacedShips.quadruple &&
                        <>
                            <span>{notPlacedShips.quadruple.length}x</span>
                            <Ship onClick={() => this.setCurrent('quadruple')} size={4}/>
                        </>
                    }
                </Cache>

                {
                    current ?
                        <>
                            <Current
                                size={current.length}
                            />


                            <Form onSubmit={this.onSubmitHandler}>
                                <span>x</span>
                                <input onChange={this.onChangeHandler} name="x" type="number" placeholder="x" value={this.state.form.x}/>

                                <span>y</span>
                                <input onChange={this.onChangeHandler} name="y" type="number" placeholder="y" value={this.state.form.y}/>

                                <span>horizontal</span>
                                <input onChange={this.onChangeHandler} name="direction" type="radio" value="0" checked={this.state.form.direction === '0'}/>

                                <span>vertical</span>
                                <input onChange={this.onChangeHandler} name="direction" type="radio" value="1" checked={this.state.form.direction === '1'}/>

                                <button>Поставить</button>
                            </Form>
                        </>
                        :
                        null
                }
            </StyledPhase1>
        );
    }
}

ShipPlacementPanel.propTypes = {
    dispatch: PropTypes.func.isRequired,
    notPlacedShips: PropTypes.object.isRequired,
    current: PropTypes.object,
    playerShips: PropTypes.array,
};

const mapStateToProps = state => ({
    playerShips: state.playerShips,
    notPlacedShips: state.notPlacedShips,
    current: state.current,
});

export default connect(mapStateToProps)(ShipPlacementPanel);