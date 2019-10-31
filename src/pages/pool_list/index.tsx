import React from 'react';
import MoreList from '@components/more_list';
import { PoolItem } from '@components/pool_item';
import { useSelector, useDispatch } from 'react-redux';
import { wsSend } from '@utils/websocket';
import store, { createAction } from '@reducers/store';
import { operationType } from '@reducers/accountReducer';

const mapToState = ({ account }) => {
    return {
        pools: account.pools,
        operation: account.operation
    }
}

const poolList = props => {
    const {history} = props;
    const { pools,operation } = useSelector(mapToState);
    const dispatch = useDispatch();
    const onRefresh = () => {
        wsSend({ method: 'pools', params: [] })
    }
    const onReachEnd = () => {
        wsSend({ method: 'pools', params: [] })

    }
    const toPool = (pool) => {
        dispatch(createAction('account/update')({
            operation: {
                ...operation,
                pool,
            }
        }))
        if(operationType.default === operation.type) {
            history.push('/operation');
        }else if (operationType.delegate === operation.type) {
            history.push('/delegate');
        }else if (operationType.undelegate === operation.type) {
            history.push('/undelegate');
        }else if (operationType.withdraw === operation.type) {
            history.push('/withdraw');
        }
    }
    React.useEffect(()=>{
        if(Object.keys(pools).length===0){
            wsSend({method:'pools', params:[]})
        }
    },[pools])
    return (
        <MoreList
            title='Pool List'
            onReachEnd={onReachEnd}
            onRefresh={onRefresh}
            hasMore={false}
            data={Object.values(pools)}
            renderItem={(pool) => {
                return <PoolItem pool={pool} toPool={toPool}/>
            }}
        />
    )
}
poolList.canGoBack = ()=>{
    const {address} = store.getState().account;
    console.log('canGoback', address);
    return address!==''
}
export default poolList;
