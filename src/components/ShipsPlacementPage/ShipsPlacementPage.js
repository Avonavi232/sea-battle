import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import styled from 'styled-components/macro';

import * as Styled from "../../styled";
import {eventsBus, mapShipsToGrid, mapToGridShiftBy1, mapToGridShiftBy2} from "../../utils/functions";
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
    render() {
        return (
            <Container>
                <Styled.Board>
                    {
                        mapToGridShiftBy2(
                            hoversGrid,
                            () => Styled.ShipPlacementCell,
                            (x, y) => eventsBus.emit(busEvents.placeShip, [x, y])
                        )
                    }
                    {mapToGridShiftBy1(symbols, () => Styled.LetterCell)}
                    {mapShipsToGrid(this.props.playerShips)}
                </Styled.Board>
                <ShipPlacementPanel/>
            </Container>
        );
    }
}

ShipsPlacementPage.propTypes = {
    dispatch: PropTypes.func.isRequired,
    playerShips: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
    playerShips: state.playerShips,
});

export default connect(mapStateToProps)(ShipsPlacementPage);