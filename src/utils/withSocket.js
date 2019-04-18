import React from "react";

export const SocketContext = React.createContext(null);

export const withSocket = WrappedComponent => props => {
    return(
        <SocketContext.Consumer>
            {io => (
                <WrappedComponent {...props} io={io}/>
            )}
        </SocketContext.Consumer>
    )
};