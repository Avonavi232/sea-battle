import React from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import * as Styled from './styled';
import Phase1 from './Phase1';
import {symbols, hoversGrid} from "./utils/lettersGrid";
import {eventsBus, mapToGrid, mapShipsToGrid} from "./utils/functions";

const testClick = (x, y) => {
    eventsBus.emit('opponentShoot', [x, y])
};

const App = props => {
    return (
        <Styled.App>
            <Styled.GlobalStyle/>

            <Styled.Grid>

                <Styled.MyBoard>
                    {
                        props.phase === 1 &&
                        mapToGrid(
                            hoversGrid,
                            () => Styled.HoverCell,
                            (x, y) => eventsBus.emit('click', [x, y]),
                            (x, y) => ({x: x + 2, y: y + 2})
                        )
                    }
                    {mapToGrid(symbols, () => Styled.LetterCell, null, (x, y) => ({x: x + 1, y: y + 1}))}
                    {mapShipsToGrid(props.playerShips)}
                </Styled.MyBoard>

                {
                    props.phase === 1 &&
                    <Phase1/>
                }

                {
                    props.phase === 2 &&
                    <>
                        <Styled.OpponentBoard>
                            {
                                mapToGrid(
                                    symbols,
                                    () => Styled.LetterCell,
                                    null,
                                    (x, y) => ({x: x + 1, y: y + 1})
                                )
                            }
                            {

                                mapToGrid(
                                    hoversGrid,
                                    () => Styled.HoverCell,
                                    testClick,
                                    (x, y) => ({x: x + 2, y: y + 2})
                                )
                            }
                        </Styled.OpponentBoard>
                        <Styled.MoveIndicator/>
                        <Styled.MoveTimer>0:30</Styled.MoveTimer>
                    </>
                }
            </Styled.Grid>
        </Styled.App>
    );
};

App.propTypes = {
    dispatch: PropTypes.func.isRequired,
    playerShips: PropTypes.array.isRequired,
    phase: PropTypes.number.isRequired,
};

const mapStateToProps = state => ({
    playerShips: state.playerShips,
    phase: state.phase
});

export default connect(mapStateToProps)(App);
