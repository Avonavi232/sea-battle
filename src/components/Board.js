import React, {Component, createRef} from 'react';
import {ReactComponent as Canvas} from "../img/field.svg";
import styled from 'styled-components/macro';
import {symbols} from "../utils/lettersGrid";
import * as Styled from "../styled";

import hit from '../img/cross.png';
import miss from '../img/miss.png';
import ship1 from '../img/ship1.png';
import ship2 from '../img/ship2.png';
import ship3 from '../img/ship3.png';
import ship4 from '../img/ship4.png';
import {TripleShip} from "../utils/ships";
import {isNumeric} from "../utils/functions";

const Page = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
`;

const Container = styled.div`
  width: 500px;
  height: 500px;
  svg {
    width: 100%;
    height: 100%;
    text {
      line-height: 1;
    }
  }
`;

const StyledCanvas = styled(({cellSize, svgRef, ...props}) => <Canvas ref={svgRef} {...props}/>)`
    font-size: ${({cellSize}) => cellSize ? `${cellSize * 0.6}px` : '1em'};
    text {
        font-family: 'Patrick Hand', cursive;
        fill: ${({theme}) => theme.inkColor};
        user-select: none;
    }
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
        this.textContainer = this.surface.select('.text');
        this.shipsContainer = this.surface.select('.ships');
        this.effectsContainer = this.surface.select('.effects');
    }

    drawChar = (x, y, char) => {
        this.textContainer
            .text(
                this.cellSize * (x + 0.5),
                this.cellSize * (y + 0.5),
                char
            )
            .attr({
                dominantBaseline: "middle",
                textAnchor: "middle"
            })
    };

    _drawImg = (params, src) => {
        const
            {x, y, width, height, rotate, cx, cy} = params;

        const element = this.surface.paper.image(src, x, y, width, height).remove();

        if (rotate) {
            const matrix = Snap.matrix()
                .rotate(
                    90,
                    cx,
                    cy,
                );
            element.transform(matrix.toLocaleString())
        }

        return element;
    };

    get _elementsSrc() {
        return {
            miss: miss,
            hit: hit,
            ship1: ship1,
            ship2: ship2,
            ship3: ship3,
            ship4: ship4,
        }
    }

    _getSvgContainers = type => {
        switch (type) {
            case 'text':
                return this.textContainer;
            case 'ship1':
            case 'ship2':
            case 'ship3':
            case 'ship4':
                return this.textContainer;
            case 'hit':
            case 'miss':
                return this.effectsContainer;
            default:
                return this.surface.paper;
        }
    };

    /**
     * @param {object} data
     * @param {number} data.x
     * @param {number} data.y
     * @param {string} data.type
     * @param {number} data.length
     * @param {boolean} data.direction
     */
    drawItem = data => {
        const
            {cellSize} = this,
            params = {
                x: cellSize * data.x,
                y: cellSize * data.y,
                width: cellSize * data.length,
                height: cellSize,
                rotate: data.direction ? 90 : false,
                cx: (cellSize * (data.x + 0.5)),
                cy: (cellSize * (data.y + 0.5))
            },
            shipImgSrc = this._elementsSrc[data.type],
            element = this._drawImg(params, shipImgSrc),
            container = this._getSvgContainers(data.type);

        container.append(element);
    };

    /**
     *
     * @param {BasicShip} ship
     */
    drawShip = ship => {
        this.drawItem({...ship.start, type: ship.type, length: ship.length})
    };

    /**
     *
     * @param {object} data
     * @param {number} data.x
     * @param {number} data.y
     * @param {string} data.type
     */
    drawShot = ({x, y, type}) => {
        if (!isNumeric(x) || !isNumeric(y) || !type) {
            throw new Error('Wrong arguments passed to drawShot');
        }

        this.drawItem({
            x: x,
            y: y,
            type: type,
            length: 1,
            direction: false,
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

        symbols.forEach(({x, y, content}) => boardDrawer.drawChar(x, y, content));
    }

    render() {
        const {boardDrawer} = this.state;
        return (
            <Page>
                <Styled.GlobalStyle/>
                <Container>
                    {
                        <StyledCanvas svgRef={this.svgRef} cellSize={boardDrawer && boardDrawer.cellSize}/>
                    }
                </Container>
            </Page>
        );
    }
}

Board.propTypes = {};

export default Board;