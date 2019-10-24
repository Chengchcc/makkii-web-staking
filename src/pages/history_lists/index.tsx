import React from 'react';
import MoreList from '@components/more_list';
import TransactionItem from '@components/transaction_item';
import {process_transaction } from '@pages/home';
import { useSelector } from 'react-redux';
import { wsSend } from '@utils/websocket';

const mapToState = ({ account }) => {
    return {
        address:account.address,
        transactions: account.history,
        pools: account.pools,
    }
}

const HistoryLists = () => {

    const { transactions,pools,address } = useSelector(mapToState);
    const onRefresh = () => {
        wsSend({ method: 'transactions', params: [address] })
    }
    const onReachEnd = () => {
        wsSend({ method: 'transactions', params: [address] })

    }

    return (
        <MoreList
            title="Stake History"
            onReachEnd={onReachEnd}
            onRefresh={onRefresh}
            hasMore={false}
            data={process_transaction(transactions)}
            renderItem={(el) => {
                return <TransactionItem pool={pools[el.pool]} transaction={el}/>
            }}
        />
    )
}

export default HistoryLists;
