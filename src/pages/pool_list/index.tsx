import React from 'react';
import MoreList from '@components/more_list';
import { PoolItem } from '@components/pool_item';
import { useSelector, useDispatch } from 'react-redux';
import { wsSend } from '@utils/websocket';
import store, { createAction } from '@reducers/store';
import { operationType } from '@reducers/accountReducer';
import { Ipool, Idelegation } from '@interfaces/types';

const mapToState = ({ account }):{
    pools: {[address: string]: Ipool},
    delegations: { [poolAddres: string]: Idelegation },
    operation: {
        pool: string,
        type: operationType
    }
} => {
    return {
        pools: account.pools,
        operation: account.operation,
        delegations: account.delegations,
    };
}



const poolList = props => {
    const {history} = props;
    const { pools, operation, delegations } = useSelector(mapToState);
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

    const [can_undelegate, can_withdraw] = Object.keys(delegations).reduce(([arr1, arr2], el)=>{
        const {stake, rewards} = delegations[el];
        if(stake.gt(0)){
            arr1.push(el);
        }
        if(rewards.gt(0)){
            arr2.push(el);
        }
        return [arr1, arr2];
    },[[],[]]);
    
    let filters = [];
    switch(operation.type){
        case operationType.undelegate:
            filters = can_undelegate;
            break;
        case operationType.withdraw:
            filters= can_withdraw;
            break;
        default:
            filters = Object.keys(pools);
    }
    
    return (
        <MoreList
            onReachEnd={onReachEnd}
            onRefresh={onRefresh}
            hasMore={false}
            data={Object.values(pools).filter(el=>filters.includes(el.address))}
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
