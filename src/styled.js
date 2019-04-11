import React from 'react';
import styled, {css, createGlobalStyle} from 'styled-components/macro';
import {darken} from 'polished';

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

export const MoveTimer = styled.div`
  grid-area: moveTimer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36px;
  font-weight: 300;
`;

export const MoveIndicator = styled.div`
    grid-area: MoveIndicator;
    place-self: center;
    padding: 1rem;
    
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

const cellHoverBase = css`
    &:hover {
        cursor: pointer;      
    }
`;

export const Cell = styled(({x, y, w, h, ...props}) => <div {...props}/>)`
  width: 100%;
  height: 100%;
  grid-area: ${({x,y,w,h}) => `${y} / ${x} / ${y + h} / ${x + w}`};
`;

export const HoverCell = styled(Cell)`
  ${cellHoverBase};
  transition: all .7s;
  ${cellBg('#777')};
  &:hover {
    border-color: green;
  }
`;

export const LetterCell = styled(Cell)`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Patrick Hand', cursive;
  color: ${darken(0.3, theme.cellColor)};
  user-select: none;
  &:hover {
    cursor: default;
  }
`;


