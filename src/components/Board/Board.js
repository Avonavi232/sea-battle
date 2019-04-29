import React, {Component, createRef} from 'react';
import PropTypes from 'prop-types'
import styled from 'styled-components/macro';
import {boardElementTypes} from "../../utils/constants";

import * as Styled from "./styled";

import {ShipPlacementCell} from "../../styled";
import {isFn, isNumeric} from "../../utils/functions";

const StyledCanvas = styled(({cellSize, svgRef, ...props}) => <svg viewBox="0 0 100 100" ref={svgRef} {...props}/>)`

    font-size: ${({cellSize}) => cellSize ? `${cellSize * 0.6}px` : '1em'};
    .grid {
      stroke: ${({theme}) => theme.cellColor};
      stroke-width: .3;
    }
`;


const Snap = window.Snap;

class BoardDrawer {
    constructor(svg) {
        this.surface = Snap(svg);
        this.surfaceBBox = this.surface.getBBox();
        this.cellSize = (this.surfaceBBox.width / 11).toFixed(2);
    }

    get _svgComponents() {
        return {
            [boardElementTypes.shipPlacement]: ShipPlacementCell,
            [boardElementTypes.char]: Styled.Char,
            [boardElementTypes.ship1]: Styled.Ship1,
            [boardElementTypes.ship2]: Styled.Ship2,
            [boardElementTypes.ship3]: Styled.Ship3,
            [boardElementTypes.ship4]: Styled.Ship4,
        }
    }


    drawItem = ({transformCoords, ...data}) => {
        const
            {cellSize} = this,
            {x: transformedX, y: transformedY} = isFn(transformCoords) ? transformCoords(data.x, data.y) : data,
            calculated = {
                x: cellSize * transformedX,
                y: cellSize * transformedY,
                width: cellSize * data.length,
                height: cellSize,
            };

        let transform = '';

        if (data.direction) {
            const
                angle = 90,
                cx = (cellSize * (transformedX + 0.5)),
                cy = (cellSize * (transformedY + 0.5));

            transform += `rotate(${angle} ${cx} ${cy})`;
        }

        const actions = {};
        if (data.actions) {
            for (const [key, fn] of Object.entries(data.actions)) {
                actions[key] = () => fn({x: data.x, y: data.y});
            }
        }

        const Component = this._svgComponents[data.type];

        return <Component
            {...actions}
            {...calculated}
            transform={transform}
            content={data.content}
        />
    };

    getDrawnComponent = element => {
        return this.drawItem({
            ...element,
            length: element.length || 1
        })
    }
}

class Board extends Component {
    constructor(props) {
        super(props);
        this.svgRef = createRef();
        this.state = {
            boardDrawer: null
        }
    }

    componentDidMount() {
        const boardDrawer = new BoardDrawer(this.svgRef.current);

        this.setState({boardDrawer});
    }

    _getGrid = () => {
        return (
            <g className="grid" transform="translate(0,-197)">
                <g transform="translate(0,195.8)">
                    <rect height="99.8" width="99.8" y="1.4" x="0.1" fill="rgb(255, 255, 255)" fillOpacity="1"/>
                    <path d="M 99.8,1.4999938 V 100.99999 H 0.3 V 1.4999938 h 99.5 m 0.2,-0.3 H 0 V 101.19999 h 100 z"/>
                </g>
                <g transform="translate(-0.34,196)">
                    <line x1="82.199997" y1="101" x2="82.199997" y2="1"/>
                    <line x1="91.300003" y1="101" x2="91.300003" y2="1"/>
                    <line x1="64.099998" y1="101" x2="64.099998" y2="1"/>
                    <line x1="73.099998" y1="101" x2="73.099998" y2="1"/>
                    <line x1="45.900002" y1="101" x2="45.900002" y2="1"/>
                    <line x1="55" y1="101" x2="55" y2="1"/>
                    <line x1="27.700001" y1="101" x2="27.700001" y2="1"/>
                    <line x1="18.6" y1="101" x2="18.6" y2="1"/>
                    <line x1="9.5" y1="101" x2="9.5" y2="1"/>
                    <line x1="36.799999" y1="101" x2="36.799999" y2="1"/>
                </g>
                <g transform="translate(-0.39999873,196.00002)">
                    <line x1="0.4" y1="82.900002" x2="100.4" y2="82.900002"/>
                    <line x1="0.4" y1="92" x2="100.4" y2="92"/>
                    <line x1="0.4" y1="64.699997" x2="100.4" y2="64.699997"/>
                    <line x1="0.4" y1="73.800003" x2="100.4" y2="73.800003"/>
                    <line x1="0.4" y1="46.5" x2="100.4" y2="46.5"/>
                    <line x1="0.4" y1="55.599998" x2="100.4" y2="55.599998"/>
                    <line x1="0.4" y1="28.299999" x2="100.4" y2="28.299999"/>
                    <line x1="0.4" y1="19.200001" x2="100.4" y2="19.200001"/>
                    <line x1="0.4" y1="10.1" x2="100.4" y2="10.1"/>
                    <line x1="0.4" y1="37.400002" x2="100.4" y2="37.400002"/>
                </g>
            </g>
        )
    }

    render() {
        const
            {boardDrawer} = this.state,
            {data} = this.props;


        return (
            <StyledCanvas svgRef={this.svgRef} cellSize={boardDrawer && boardDrawer.cellSize}>
                {this._getGrid()}

                {/*{*/}
                {/*    boardDrawer && chars &&*/}
                {/*    chars.map((charData, i) => {*/}
                {/*        return boardDrawer.drawChar({...charData, key: i});*/}
                {/*    })*/}
                {/*}*/}

                {
                    boardDrawer &&
                    data.map(part => {
                        return part.elements.map((el, i) => {
                            return React.cloneElement(
                                boardDrawer.getDrawnComponent({
                                    ...el,
                                    transformCoords: part.transformCoords,
                                    actions: part.actions
                                }, i),
                                {
                                    key: el.id
                                }
                            );
                        });
                    })
                }
            </StyledCanvas>
        );
    }
}

Board.defaultProps = {
    data: []
};

Board.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        elements: PropTypes.arrayOf(PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
            type: PropTypes.string.isRequired,
            id: PropTypes.oneOfType([
                PropTypes.string.isRequired,
                PropTypes.number.isRequired,
            ]).isRequired,
            content: PropTypes.oneOfType([
                PropTypes.string.isRequired,
                PropTypes.number.isRequired,
            ]),
        }).isRequired).isRequired,
        transformCoords: PropTypes.func,
        action: PropTypes.func,
    }).isRequired,),
};

export default Board;