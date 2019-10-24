import React from 'react';
import router from '@pages/router';
import history from '@utils/history';
import { Provider } from 'react-redux';
import store from './reducers/store';

const app = () => {
    return <Provider store={store}>
        {router({ history })}
    </Provider>
}
export default app;