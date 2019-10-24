import { createStore, combineReducers } from 'redux';
import accountReducers from '@reducers/accountReducer';

const reducers = combineReducers({
    account: accountReducers,
})


const store = createStore(reducers);
export const createAction = type => payload => ({ type, payload });
global.store = store;
export default store;