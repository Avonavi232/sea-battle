import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import styled from 'styled-components/macro';

import * as Styled from "../../styled";
import {eventsBus, mapShipsToGrid, mapToGridShiftBy1, mapToGridShiftBy2, shipPlacementValidator} from "../../utils/functions";
import {hoversGrid, symbols} from "../../utils/lettersGrid";
import {busEvents} from "../../utils/constants";
import ShipPlacementPanel from "../ShipsPlacementPanel";

const Container = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 3fr 2fr;
  place-content: center center;
  grid-gap: 2rem;
  @media ${({theme}) => theme.breakpointUp.md} {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 40vh;
  }
`;

class ShipsPlacementPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            form: {
                direction: '0'
            }
        }
    }

    onChangeHandler = ({target}) => {
        this.setState({
            form: {
                ...this.state.form,
                [target.name]: target.value
            }
        })
    };

    flattenPlayerShips = () => {
        return this.props.playerShips.reduce((acc, ship) => {
            return {
                ...acc,
                ...ship.parts
            }
        }, {})
    };

    getAvailablePlaces = () => {
        const
            {current} = this.props,
            {direction} = this.state.form;

        if (!current || !direction) {
            return [];
        }

        const
            playerShips = this.flattenPlayerShips(),
            goingToBePlaced = {
                checkDirection: () => direction == '0',
                length: current.length
            };

        return hoversGrid.filter(coords => shipPlacementValidator.validate(coords, goingToBePlaced, playerShips))
    }

    render() {
        return (
            <Container>
                <Styled.Board>
                    {
                        mapToGridShiftBy2(
                            this.getAvailablePlaces(),
                            () => Styled.ShipPlacementCell,
                            (x, y) => eventsBus.emit(busEvents.placeShip, [x, y])
                        )
                    }
                    {mapToGridShiftBy1(symbols, () => Styled.LetterCell)}
                    {mapShipsToGrid(this.props.playerShips)}
                </Styled.Board>
                <ShipPlacementPanel currentDirection={this.state.form.direction} onChangeHandler={this.onChangeHandler}/>
            </Container>
        );
    }
}

ShipsPlacementPage.propTypes = {
    dispatch: PropTypes.func.isRequired,
    playerShips: PropTypes.array.isRequired,
    current: PropTypes.object,
};

const mapStateToProps = state => ({
    playerShips: state.playerShips,
    current: state.current,
});

export default connect(mapStateToProps)(ShipsPlacementPage);