import React from 'react';
import styled, {css} from "styled-components/macro";
import {ReactComponent as AimIcon} from "../../img/aim.svg";
import {ReactComponent as HitIcon} from "../../img/hit.svg";
import hitImg from '../../img/cross.png';
import missImg from '../../img/miss.png';
import ship1 from '../../img/ship1.png';
import ship2 from '../../img/ship2.png';
import ship3 from '../../img/ship3.png';
import ship4 from '../../img/ship4.png';

const cellHoverBase = css`
    &:hover {
        cursor: pointer;       
    }
`;


export const ShipPlacementCell = styled(props => <HitIcon {...props}/>)`
  ${cellHoverBase};
    opacity: .15;
    transition: all .2s;
    
    path {
      fill: ${({theme}) => theme.inkColor}
    }
    
    &:hover {
      opacity: .6;
    }
`;

const BasicSvgImage = ({content, ...props}) => {
    return (
        <image {...props} preserveAspectRatio="none"/>
    )
};

const CharCell = styled(({content, width, height, x, y, ...props}) => {
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

const AimCell = styled(props => <AimIcon {...props}/>)`
  ${cellHoverBase};
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
  
  &:hover{
    opacity: 1;
  }
`;

const Ship = ({x, y, cellSize, parts, width, height, transform, shipImgSrc}) => {
    return(
        <g transform={`translate(${x} ${y}) ${transform}`}>
            <BasicSvgImage width={width} height={height} href={shipImgSrc} />
            {
                Object.keys(parts).sort().map((elKey, i) => {
                    const el = parts[elKey];
                    if (el.type === 'hit') {
                        return <BasicSvgImage
                            key={el.id}
                            width={cellSize}
                            height={cellSize}
                            x={i * cellSize}
                            href={hitImg}
                        />
                    } else {
                        return null
                    }
                })
            }
        </g>
    )
};

const createShipGetter = shipImgSrc => ({x, y, cellSize, parts, width, height, transform}) => {

    return <Ship {...{x, y, cellSize, parts, width, height, transform}} shipImgSrc={shipImgSrc}/>
};

export const getShip1 = createShipGetter(ship1);
export const getShip2 = createShipGetter(ship2);
export const getShip3 = createShipGetter(ship3);
export const getShip4 = createShipGetter(ship4);

export const getCharCell = ({content, width, height, x, y}) => {
    return <CharCell {...{content, width, height, x, y}}/>
};

export const getShipPlacementCell = ({width, height, x, y, actions}) => {
    return <ShipPlacementCell {...{width, height, x, y}} {...actions}/>
};

export const getAimCell = ({width, height, x, y, actions}) => {
    return <AimCell {...{width, height, x, y}} {...actions}/>
};

export const getShotMissCell = ({width, height, x, y}) => <BasicSvgImage {...{width, height, x, y}} href={missImg} />;
export const getShotHitCell = ({width, height, x, y}) => <BasicSvgImage {...{width, height, x, y}} href={hitImg} />;
