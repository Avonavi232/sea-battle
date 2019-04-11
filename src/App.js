import React from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import * as Styled from './styled';
import Phase1 from './Phase1';
import {symbols} from "./utils/lettersGrid";

const mapToGrid = (items, Component) => {
    return items.map((item, index) => {
        return <Component
            key={item.id || index}
            x={item.x}
            y={item.y}
            w={1}
            h={1}
        >
            {item.content}
        </Component>
    });
};

const mapShipsToGrid = ships => {
    return ships.map(ship => mapToGrid(ship.parts, Styled.HoverCell))
};

const App = props => {
    return (
        <Styled.App>
            <Styled.GlobalStyle/>

            <Styled.Grid>
                {/*<Styled.MoveIndicator/>*/}
                {/*<Styled.MoveTimer>0:30</Styled.MoveTimer>*/}

                <Styled.MyBoard>
                    {mapToGrid(symbols, Styled.LetterCell)}
                    {mapShipsToGrid(props.playerShips)}
                </Styled.MyBoard>

                {/*<Styled.OpponentBoard/>*/}

                <Phase1/>
            </Styled.Grid>
        </Styled.App>
    );
};

App.propTypes = {
    dispatch: PropTypes.func.isRequired,
    playerShips: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
    playerShips: state.playerShips,
});

export default connect(mapStateToProps)(App);
