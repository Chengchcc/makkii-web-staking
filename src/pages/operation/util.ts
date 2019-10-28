import React from 'react';
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

export const useListenKeyboard = () => {
    const [enable, setEnable] = React.useState(false);
    const resize = ()=> {
        console.log('resize')
        const clientHeight = document.documentElement.clientHeight || document.body.clientHeight
        if (this.state.clientHeight > clientHeight){
            setEnable(true)
        }else{
            setEnable(false)
        }
    }
    React.useEffect(()=>{
        window.addEventListener('resize', resize);
        return ()=>{
            window.removeEventListener('resize', resize);
        }
    },[])
    return enable
}