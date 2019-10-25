import React from 'react';
import MoreList from '@components/more_list';
import { PoolItemMore } from '@components/pool_item';
import {process_delegations,delegationInfo } from '@pages/home';
import { useSelector } from 'react-redux';
import { wsSend } from '@utils/websocket';

const mapToState = ({ account }) => {
    return {
        address:account.address,
        delegations: account.delegations,
        pools: account.pools,
        stakedAmount: account.stakedAmount,
        pagination: account.delegationsPagination,
    }
}

const Delegations = () => {

    const { delegations,pools,stakedAmount,address,pagination } = useSelector(mapToState);
    const onRefresh = () => {
        wsSend({ method: 'delegations', params: [address, 0, 10] })
    }
    const onReachEnd = () => {
        wsSend({ method: 'delegations', params: [address, pagination.current, 10] })

    }
    const hasMore = pagination.current + 1 <pagination.total;
    return (
        <MoreList
            title={`My Delegations: ${stakedAmount} AION`}
            onReachEnd={onReachEnd}
            onRefresh={onRefresh}
            hasMore={hasMore}
            data={process_delegations(delegations)}
            renderItem={(el) => {
                return <PoolItemMore pool={pools[el.poolAddress]} value={el} info={delegationInfo}/>
            }}
        />
    )
}

export default Delegations;
