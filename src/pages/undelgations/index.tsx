import React from 'react';
import MoreList from '@components/more_list';
import { PoolItemMore } from '@components/pool_item';
import {process_undelegations,unDelegationInfo } from '@pages/home';
import { useSelector } from 'react-redux';
import { wsSend } from '@utils/websocket';

const mapToState = ({ account }) => {
    return {
        address: account.address,
        undelegations: account.undelegations,
        pools: account.pools,
        undelegationAmount: account.undelegationAmount,
        pagination: account.undelegationsPagination,
    }
}

const Undelegations = () => {

    const { undelegations,pools,undelegationAmount,address,pagination } = useSelector(mapToState);
    const onRefresh = () => {
        wsSend({ method: 'undelegations', params: [address, 0, 10] })
    }
    const onReachEnd = () => {
        wsSend({ method: 'undelegations', params: [address, pagination.current+1, 10] })
    }
    const hasMore = pagination.current + 1 <pagination.total;
    return (
        <MoreList
            title={`Pending Undelegation: ${undelegationAmount}AION`}
            onReachEnd={onReachEnd}
            onRefresh={onRefresh}
            hasMore={hasMore}
            data={process_undelegations(undelegations)}
            renderItem={(el) => {
                return <PoolItemMore pool={pools[el.poolAddress]} value={el} info={unDelegationInfo}/>
            }}
        />
    )
}

export default Undelegations;
