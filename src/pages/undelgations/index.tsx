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
        undelegationAmount: account.undelegationAmount
    }
}

const Undelegations = () => {

    const { undelegations,pools,undelegationAmount,address } = useSelector(mapToState);
    const onRefresh = () => {
        wsSend({ method: 'undelegations', params: [address] })
    }
    const onReachEnd = () => {
        wsSend({ method: 'undelegations', params: [address] })

    }

    return (
        <MoreList
            title={`Pending Undelegation: ${undelegationAmount}AION`}
            onReachEnd={onReachEnd}
            onRefresh={onRefresh}
            hasMore={false}
            data={process_undelegations(undelegations)}
            renderItem={(el) => {
                return <PoolItemMore pool={pools[el.poolAddress]} value={el} info={unDelegationInfo}/>
            }}
        />
    )
}

export default Undelegations;
