import React from 'react';
import MoreList from '@components/more_list';
import { PoolItem } from '@components/pool_item';
import { useSelector, useDispatch } from 'react-redux';
import { wsSend } from '@utils/websocket';
import { createAction } from '@reducers/store';

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
    console.log('pools=', Object.values(pools))
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
        history.push('/operation');
    }
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

export default poolList;
