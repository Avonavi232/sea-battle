import React from 'react';
import styled, {css} from "styled-components/macro";
import {ReactComponent as AimIcon} from "../../img/aim.svg";
import {ReactComponent as HitIcon} from "../../img/hit.svg";
import {ReactComponent as MissIcon} from "../../img/circle-sketch.svg";
import hit from '../../img/cross.png';
import miss from '../../img/miss.png';
import ship1 from '../../img/ship1.png';
import ship2 from '../../img/ship2.png';
import ship3 from '../../img/ship3.png';
import ship4 from '../../img/ship4.png';

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
  svg {
    display: block;
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


export const ShipCell = styled(props => {
    return (
        <Cell {...props}>
            <HitIcon {...props} className="hit-cell__svg"/>
        </Cell>
    )
})`
  .hit-cell__svg {
    width: 100%;
    height: 100%;
    path {
      fill: ${({theme}) => theme.inkColor}
    }
  }
`;

export const ShipPlacementCell = styled(({transform, ...props}) => {
    return (
        <HitIcon {...props}/>
    )
})`
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
      fill: ${({theme}) => theme.inkColor}
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
      fill: ${({theme}) => theme.inkColor}
    }
  }
`;

export const Char = styled(({hoverable, transform, content, width, height, x, y, ...props}) => {
    return (
        <g {...props} transform={`translate(${x},${y})`}>
            <svg width={width} height={height}>
                <rect x={0} y={0} width={width} height={height} fill="none"/>
                <text x="50%" y="50%">{content}</text>
            </svg>
        </g>
    )
})`

    text {
        dominant-baseline: middle;
        text-anchor: middle;
        font-family: 'Patrick Hand', cursive;
        fill: ${({theme}) => theme.inkColor};
        user-select: none;
    }
`;

const BasicShip = ({content, ...props}) => {
    console.log(props);
    return (
        <image {...props} preserveAspectRatio="none"/>
    )
};

export const Ship1 = props => <BasicShip {...props} href={ship1} />;
export const Ship2 = props => <BasicShip {...props} href={ship2} />;
export const Ship3 = props => <BasicShip {...props} href={ship3} />;
export const Ship4 = props => <BasicShip {...props} href={ship4} />;
