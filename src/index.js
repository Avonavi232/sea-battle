import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {ThemeProvider} from 'styled-components';

import App from './App';
import store from './store';
import 'input-range-scss';
import './scss/bootstrap.scss';
import {theme} from "./styled";

ReactDOM.render(
    <Provider store={store}>
        <ThemeProvider theme={theme}>
            <App/>
        </ThemeProvider>
    </Provider>,
    document.getElementById('root')
);

