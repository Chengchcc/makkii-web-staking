import store, { createAction } from '@reducers/store';
import history from '@utils/history';
import { operationType } from '@reducers/accountReducer';


export const commonGoback = ()=>{
    const {operation} = store.getState().account;
    store.dispatch(createAction('account/update')({
        operation: {
            ...operation,
            type: operationType.default
        }
    }))
    history.go(-1)
}