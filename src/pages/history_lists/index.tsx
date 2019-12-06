import React from 'react';
import MoreList from '@components/more_list';
import TransactionItem from '@components/transaction_item';
import { useSelector } from 'react-redux';
import { wsSendOnce } from '@utils/websocket';
import { process_transctions } from '@pages/home';

const mapToState = ({ account }) => {
    return {
        address:account.address,
        transactions: account.history,
        pools: account.pools,
        pagination: account.historyPagination
    }
}
let scrollTop = 0;
const HistoryLists = () => {

    const { transactions,pools,address, pagination } = useSelector(mapToState);
    const onRefresh = () => {
        wsSendOnce({ method: 'transactions', params: [address, 0, 10] })
    }
    const onReachEnd = () => {
        wsSendOnce({ method: 'transactions', params: [address, pagination.current+1, 10] })
    }
    const hasMore = pagination.current + 1 <pagination.total;

    React.useEffect(() => {
        const element = document.getElementById('pullLoadContainer') || document.body;
        const handleScollTop = e => {
            scrollTop = e.target.scrollTop;
        };
        element.addEventListener('scroll', handleScollTop);
        if (scrollTop&&navigator.userAgent.match('Android')) {
            element.scrollTop = scrollTop;
        }
        return () => {
            element.removeEventListener('scroll', handleScollTop);
        }
    });
    return (
        <MoreList
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
