import {applyMiddleware, createStore} from "redux";
import reducer from '../reducers';
import {composeWithDevTools} from "redux-devtools-extension/developmentOnly";
import thunkMiddleware from "redux-thunk";


const store = createStore(
    reducer,
    composeWithDevTools(
        applyMiddleware(
            thunkMiddleware
        )
    )
);

export default store;