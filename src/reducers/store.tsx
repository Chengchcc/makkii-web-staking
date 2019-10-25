/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
import { createStore, combineReducers } from 'redux';
import accountReducers from '@reducers/accountReducer';

const reducers = combineReducers({
    account: accountReducers,
})

// eslint-disable-next-line import/no-mutable-exports
let store;
if(process.env.NODE_ENV === 'development'){
    const {devToolsEnhancer} = require('redux-devtools-extension');
    store =  createStore(reducers, devToolsEnhancer());
}else{
    store = createStore(reducers);
}

export const createAction = type => payload => ({ type, payload });
window.store = store;
export default store;