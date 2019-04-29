import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import styled from 'styled-components/macro';

import * as Styled from "../../styled";
import {eventsBus, mapToGridShiftBy2, shipPlacementValidator} from "../../utils/functions";
import {coordsGrid, symbols} from "../../utils/lettersGrid";
import {busEvents} from "../../utils/constants";
import ShipPlacementPanel from "../ShipsPlacementPanel";
import {BasicShip} from "../../utils/ships";

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


const mapShipsToGrid = ships => {
    const getComponent = shipPart => {
        switch (shipPart.type) {
            case BasicShip.types.kill:
                return Styled.ShipDieCell;

            case BasicShip.types.hit:
                return Styled.ShotHitCell;

            case BasicShip.types.ship:
            default:
                return Styled.ShipCell
        }
    };

    return ships.map(ship => mapToGridShiftBy2(Object.values(ship.parts), getComponent))
};


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

        return coordsGrid.filter(coords => shipPlacementValidator.validate(coords, goingToBePlaced, playerShips))
    }

    render() {
        const ships = [
            {
                direction: 1,
                start: {
                    x: 0,
                    y: 2,
                },
                type: 'ship4',
                length: 4,
                id: 'asfdasdf'
            }
        ];

        const data = [].concat(
            {
                elements: this.getAvailablePlaces(),
                transformCoords: (x, y) => ({x: x + 1, y: y + 1}),
                actions: {
                    onClick: ({x, y}) => eventsBus.emit(busEvents.placeShip, [x, y])
                }
            },
            {
                elements: symbols
            },
            {
                elements: this.props.playerShips.map(({direction, start: {x, y}, type, length, id}) => ({
                    direction,
                    x,
                    y,
                    type,
                    length,
                    id
                })),

                transformCoords: (x, y) => ({x: x + 1, y: y + 1}),
            }
        );

        return (
            <Container>

                <Styled.Board data={data} />

                    {/*{*/}
                    {/*    mapToGridShiftBy2(*/}
                    {/*        this.getAvailablePlaces(),*/}
                    {/*        () => Styled.ShipPlacementCell,*/}
                    {/*        (x, y) => eventsBus.emit(busEvents.placeShip, [x, y])*/}
                    {/*    )*/}
                    {/*}*/}
                    {/*{mapShipsToGrid(this.props.playerShips)}*/}
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