import React from 'react';
import styled, {css, createGlobalStyle} from 'styled-components/macro';

import {ReactComponent as AimIcon} from './img/aim.svg';
import {ReactComponent as HitIcon} from './img/hit.svg';
import {ReactComponent as MissIcon} from './img/circle-sketch.svg';
import paper from './img/paper.jpg';
import config from './config';
import {SquaredContainer} from "./components/SquareContainer";


export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Roboto:300,400');
  @import url('https://fonts.googleapis.com/css?family=Patrick+Hand');
  body {
    margin: 0;
    padding: 0;
    font-family: Roboto, sans-serif;
  }
  * {
    box-sizing: border-box;
  }
`;

const theme = {
    cellColor: '#d1d6ff',
    inkColor: '#2EABEC',
    cellLineWidth: '1px',
    boardFontSize: '36px',
    boardSize: config.boardSize
};

export const cellBg = (color = theme.cellColor) => css`
    background: 
        linear-gradient(
            ${color} ${theme.cellLineWidth}, 
            transparent ${theme.cellLineWidth},
            transparent 100%
         ),
        linear-gradient(
            90deg, 
            ${color} ${theme.cellLineWidth},
            transparent ${theme.cellLineWidth},
            transparent 100%
        ) 1em 1em;
    
    background-size: 1em 1em;
    
    border-right: ${theme.cellLineWidth} solid ${color};
    border-bottom: ${theme.cellLineWidth} solid ${color};
`;

export const App = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 1rem;
  &:before {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    background-image: url("${paper}");
    z-index: -1;
    opacity: 0.4;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-gap: 1rem;
  place-content: start center;
  width: 100%;
  height: 100%;
  max-width: 900px;
  
  grid-template: 
        "moveTimer  moveTimer     moveTimer" 100px
        "MyBoard    MoveIndicator OpponentBoard" 400px //TODO можно попробовать bootstrap embed 
      /  1fr        min-content           1fr;
  
  @media all and (max-width: 768px) {
    grid-template: 
        "MyBoard MyBoard" 2fr
        "MoveIndicator  moveTimer" min-content
        "OpponentBoard OpponentBoard" 3fr
      /  1fr 1fr;
  }
`;

export const MoveIndicator = styled.div`
    grid-area: MoveIndicator;
    place-self: center;
    transition: all .3s;
    transform-origin: center;
    transform: ${({shooter}) => !shooter && 'rotate(180deg)'};
    padding: 0 1rem;
    
    &:before {
        content: '';
        display: inline-block;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 50px 0 50px 50px;
        border-color: transparent transparent transparent ${theme.inkColor};
    } 
    @media all and (max-width: 768px) {
        &:before {
            transform: rotate(90deg);
            border-width: 35px 0 35px 25px;
        } 
    }
`;


const boardGrid = css`
  display: grid;
  font-size: ${theme.boardFontSize};
  grid-template: repeat(${theme.boardSize + 1}, 1em) / repeat(${theme.boardSize + 1}, 1em);
`;

const Board = styled(props => {
    return (
        <SquaredContainer {...props} innerClassName="inner">
            {props.children}
        </SquaredContainer>
    )
})`
  place-self: center;
  width: 100%;
  height: 100%;
  position: relative;
  & > .inner {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    ${cellBg()};
    ${boardGrid}
  }
`;

export const MyBoard = styled(Board)`
  grid-area: MyBoard;
`;

export const OpponentBoard = styled(Board)`
  grid-area: OpponentBoard;
`;

// export const OpponentBoard = styled.div`
//   grid-area: OpponentBoard;
//   place-self: center;
//   ${cellBg()}
//   ${boardGrid}
// `;


/************CELLS***********/

const cellHoverBase = css`
    &:hover {
        cursor: pointer;      
    }
`;

export const Cell = styled(({x, y, w, h, ...props}) => <div {...props}/>).attrs(({x, y, w, h}) => ({
    style: {gridArea: `${y} / ${x} / ${y + h} / ${x + w}`}
}))`
  width: 100%;
  height: 100%;
`;


export const AimCell = styled(props => {
    return (
        <Cell {...props}>
            <AimIcon className="aim-cell__svg"/>
        </Cell>
    )
})`
  ${cellHoverBase};
  transition: all .1s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .aim-cell__svg {
    opacity: 0;
    transition: all .2s;
    width: 80%;
    height: 80%;
    display: block;
    position: relative;
    left: 1px;
    top: 1px;
    path{
      fill: #35d494;
    }
  }
  
  &:hover .aim-cell__svg{
    opacity: 1;
    animation: heartbeat 1.5s ease-in-out infinite both;
  }
  
  @keyframes heartbeat {
      from {
        transform: scale(1);
        transform-origin: center center;
        animation-timing-function: ease-out;
      }
      10% {
        transform: scale(0.91);
        animation-timing-function: ease-in;
      }
      17% {
        transform: scale(0.98);
        animation-timing-function: ease-out;
      }
      33% {
        transform: scale(0.87);
        animation-timing-function: ease-in;
      }
      45% {
        transform: scale(1);
        animation-timing-function: ease-out;
      }
    }
`;


export const ShipCell = styled(props => {
    return (
        <Cell {...props}>
            <HitIcon className="hit-cell__svg"/>
        </Cell>
    )
})`
  .hit-cell__svg {
    width: 100%;
    height: 100%;
    path {
      fill: ${theme.inkColor}
    }
  }
`;

export const ShipPlacementCell = styled(ShipCell)`
  ${cellHoverBase};
  opacity: .15;
  transition: all .2s;
  &:hover {
    opacity: .6;
  }
`;


export const ShotHitCell = styled(props => {
    return (
        <Cell {...props}>
            <HitIcon className="hit-cell__svg"/>
        </Cell>
    )
})`
  position: relative;
  overflow: hidden;
  &:after,
  &:before {
    content: '';
    position: absolute;
    top: -25%;
    bottom: -25%;
    left: 50%;
    width: 2px;
    background-color: #ff6464;
  }
  &:before {
    transform: translateX(-50%) rotate(45deg);
  }
  &:after {
    transform: translateX(-50%) rotate(-45deg);
  }
  .hit-cell__svg {
    width: 100%;
    height: 100%;
    path {
      fill: ${theme.inkColor}
    }
  }
`;

export const ShipDieCell = styled(ShotHitCell)`
  opacity: 0.3;
`;

export const ShotMissCell = styled(props => {
    return (
        <Cell {...props}>
            <MissIcon className="miss-cell__svg"/>
        </Cell>
    )
})`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  .miss-cell__svg {
    display: block;
    width: .4em;
    height: .4em;
    path {
      fill: ${theme.inkColor}
    }
  }
`;

export const LetterCell = styled(Cell)`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Patrick Hand', cursive;
  color: ${theme.inkColor};
  user-select: none;
  &:hover {
    cursor: default;
  }
`;


