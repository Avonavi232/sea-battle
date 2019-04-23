import React, {useEffect, useRef} from 'react';
import {debounce} from "../utils/functions";

export const SquaredContainer = ({innerClassName, ...props}) => {
    const
        innerRef = useRef(null),
        outerRef = useRef(null);

    const onResizeHandler = debounce(() => {
        const
            outer = outerRef.current,
            inner = innerRef.current,
            height = outer.offsetHeight,
            width = outer.offsetWidth,
            min = Math.min(height, width);

        inner.style.width = `${min}px`;
        inner.style.height = `${min}px`;
        inner.style.fontSize = `${min / 11}px`; //TODO подумать, куда лучше перенести fontSize
    }, 100);

    useEffect(() => {
        onResizeHandler();
        window.addEventListener('resize', onResizeHandler);

        return () => window.removeEventListener('resize', onResizeHandler);
    }, []);

    return(
        <div {...props} ref={outerRef}>
            <div className={innerClassName} ref={innerRef}>
                {props.children}
            </div>
        </div>
    )
};