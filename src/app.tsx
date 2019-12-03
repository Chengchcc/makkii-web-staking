import React from 'react';
import router from '@pages/router';
import history from '@utils/history';
import { Provider } from 'react-redux';
import store from './reducers/store';
import { send_event_log } from '@utils/httpclient';

const app = () => {
    send_event_log({
        user: 'staking',
        event: 'STAKING_ACCESS',
    });
    return <Provider store={store}>
        {router({ history })}
    </Provider>
}
export default app;