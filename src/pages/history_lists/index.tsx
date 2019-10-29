import React from 'react';
import MoreList from '@components/more_list';
import TransactionItem from '@components/transaction_item';
import { useSelector } from 'react-redux';
import { wsSend } from '@utils/websocket';
import { process_transctions } from '@pages/home';

const mapToState = ({ account }) => {
    return {
        address:account.address,
        transactions: account.history,
        pools: account.pools,
        pagination: account.historyPagination
    }
}

const HistoryLists = () => {

    const { transactions,pools,address, pagination } = useSelector(mapToState);
    const onRefresh = () => {
        wsSend({ method: 'transactions', params: [address, 0, 10] })
    }
    const onReachEnd = () => {
        wsSend({ method: 'transactions', params: [address, pagination.current+1, 10] })
    }
    const hasMore = pagination.current + 1 <pagination.total;

    return (
        <MoreList
            title="Stake History"
            onReachEnd={onReachEnd}
            onRefresh={onRefresh}
            hasMore={hasMore}
            data={process_transctions(transactions)}
            renderItem={(el) => {
                return <TransactionItem pool={pools[el.pool]} transaction={el}/>
            }}
        />
    )
}

export default HistoryLists;
