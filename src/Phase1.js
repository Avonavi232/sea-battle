import React, {Component} from 'react';
import styled from 'styled-components/macro';
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import * as ships from "./utils/ships";
import {cellBg} from "./styled";
import {addPlayerShip, setCurrent, setNotDistributedShips} from "./actions";
import config from './config';
import {between} from "./utils/functions";

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

class Phase1 extends Component {

    componentDidMount() {
        this.props.dispatch(setNotDistributedShips({
            single: [1, 1, 1, 1].map(() => new ships.SingleShip()),
            double: [1, 1, 1].map(() => new ships.DoubleShip()),
            triple: [1, 1].map(() => new ships.TripleShip()),
            quadruple: [1].map(() => new ships.QuadrupleShip()),
        }))
    }

    setCurrent = type => {
        const target = this.props.notDistributedShips[type][0];
        if (target) {
            this.props.dispatch(setCurrent(target))
        }
    };

    distributePlayerShip = event => {
        event.preventDefault();
        const
            x =  Number(event.target.x.value),
            y =  Number(event.target.y.value),
            direction = Number(event.target.direction.value),
            {dispatch} = this.props;

        if (
            !between(x, 0, config.boardSize + 1)
            || !between(y, 0, config.boardSize + 1)
        ) {
            return;
        }

        const ship = this.props.current;
        ship.pos = {
            x: x + 1,
            y: y + 1,
            direction
        };

        const cache = {...this.props.notDistributedShips};

        for (let key in cache) {
            let index = cache[key].indexOf(ship);

            if(index !== -1) {
                const clone = cache[key].slice();
                clone.splice(index, 1);
                cache[key] = clone;
                break;
            }
        }

        dispatch(setCurrent(null));
        dispatch(setNotDistributedShips(cache));
        dispatch(addPlayerShip(ship));
    };


    render() {
        const {notDistributedShips, current} = this.props;

        return (
            <StyledPhase1>
                <Cache>
                    {
                        notDistributedShips.single &&
                        <>
                            <span>{notDistributedShips.single.length}x</span>
                            <Ship onClick={() => this.setCurrent('single')} size={1}/>
                        </>
                    }

                    {
                        notDistributedShips.double &&
                        <>
                            <span>{notDistributedShips.double.length}x</span>
                            <Ship onClick={() => this.setCurrent('double')} size={2}/>
                        </>
                    }

                    {
                        notDistributedShips.triple &&
                        <>
                            <span>{notDistributedShips.triple.length}x</span>
                            <Ship onClick={() => this.setCurrent('triple')} size={3}/>
                        </>
                    }

                    {
                        notDistributedShips.quadruple &&
                        <>
                            <span>{notDistributedShips.quadruple.length}x</span>
                            <Ship onClick={() => this.setCurrent('quadruple')} size={4}/>
                        </>
                    }
                </Cache>

                {
                    current ?
                        <>
                            <Current size={current.length}/>

                            <Form onSubmit={this.distributePlayerShip}>
                                <span>x</span>
                                <input name="x" type="number" placeholder="x" defaultValue="1"/>

                                <span>y</span>
                                <input name="y" type="number" placeholder="y" defaultValue="1"/>

                                <span>horizontal</span>
                                <input name="direction" type="radio" value="0" defaultChecked/>

                                <span>vertical</span>
                                <input name="direction" type="radio" value="1"/>

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

Phase1.propTypes = {
    dispatch: PropTypes.func.isRequired,
    notDistributedShips: PropTypes.object.isRequired,
    current: PropTypes.object,
};

const mapStateToProps = state => ({
    notDistributedShips: state.notDistributedShips,
    current: state.current,
});

export default connect(mapStateToProps)(Phase1);