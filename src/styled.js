import React from 'react';
import styled, {css, createGlobalStyle} from 'styled-components/macro';
import {darken} from 'polished';

import {ReactComponent as AimIcon} from './img/aim.svg';
import {ReactComponent as HitIcon} from './img/hit.svg';
import config from './config';


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
    cellColor: '#bbe4f9',
    inkColor: darken(0.3, '#bbe4f9'),
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
`;

export const Grid = styled.div`
  display: grid;
  grid-template: 
    "moveTimer  moveTimer     moveTimer" 100px
    "MyBoard    MoveIndicator OpponentBoard" minmax(min-content, max-content)
  /  min-content        min-content           min-content;
  grid-gap: 1rem;
  place-content: start center;
`;

export const MoveIndicator = styled.div`
    grid-area: MoveIndicator;
    place-self: center;
    padding: 1rem;
    transition: all .3s;
    transform-origin: center;
    transform: ${({shooter}) => !shooter && 'rotate(180deg)'};
    
    &:before {
        content: '';
        display: inline-block;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 50px 0 50px 50px;
        border-color: transparent transparent transparent #6980fe;
    } 
`;


const boardGrid = css`
  display: grid;
  grid-template: repeat(${theme.boardSize + 1}, 1em) / repeat(${theme.boardSize + 1}, 1em);
  font-size: ${theme.boardFontSize};
  height: ${theme.boardSize + 1}em;
  width: ${theme.boardSize + 1}em;
`;

export const MyBoard = styled.div`
  height: 12em;
  width: 12em;
  grid-area: MyBoard;
  place-self: center;
  ${cellBg()}
  ${boardGrid}
`;

export const OpponentBoard = styled.div`
  grid-area: OpponentBoard;
  place-self: center;
  ${cellBg()}
  ${boardGrid}
`;


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

export const HoverCell = styled(Cell)`
  ${cellHoverBase};
  transition: all .2s;
  
  &:hover {
    background-color: red;
  }
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

export const ShipCell = styled(Cell)`
  background-color: #6a9cf8;
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

export const ShotMissCell = styled(Cell)`
  position: relative;
  overflow: hidden;
  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: .3em;
    height: .3em;
    border-radius: 50%;
    background-color: red;
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


