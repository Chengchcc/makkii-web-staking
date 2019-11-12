/* eslint-disable no-unused-vars */
import React from 'react';
import { History } from 'history'
import { operationType } from '@reducers/accountReducer';
import Spin from '@components/spin';
import { useSelector, useDispatch } from 'react-redux';
import { formatAddress, handleSwitchAccount } from '@utils/index';
import { wsSend } from '@utils/websocket';
import { PoolItem, PoolItemMore, Iinfo } from '@components/pool_item';
import TransactionItem from '@components/transaction_item';
import { createAction } from '@reducers/store';
import operation from '@pages/operation';
import { CommonButton } from '@components/button';
import Card from './card';
import './style.less';


export const delegationInfo: Array<Iinfo> = [
    {
        title: 'Delegate',
        dataIndex: 'stake',
        render: val => <span>{`${val.toFixed(5)} AION`}</span>
    },
    {
        title: 'Rewards',
        dataIndex: 'rewards',
        render: val => <span>{`${val.toFixed(5)} AION`}</span>
    }
];

export const unDelegationInfo: Array<Iinfo> = [
    {
        title: 'Block number',
        dataIndex: 'blockNumber',
        render: val => <span>{`#${val}`}</span>
    },
    {
        title: 'Amount',
        dataIndex: 'amount',
        render: val => <span>{`${val.toFixed(3)} AION`}</span>
    }
]

export const process_delegations = (deleagtions) => {
    return Object.keys(deleagtions).reduce((arr, el) => {
        arr.push({
            ...deleagtions[el],
            poolAddress: el,
        })
        return arr;
    }, [])
}


export const process_undelegations = (undelegations) => {
    return Object.keys(undelegations).reduce((arr, el) => {
        arr.push({
            ...undelegations[el],
            poolAddress: undelegations[el].pool,
        })
        return arr;
    }, [])
}

export const process_transctions = transctions => {
    return Object.values(transctions).sort((a: any, b: any) => a.timestamp - b.timestamp)
}
interface Ihome {
    history: History,
}
const mapToState = ({ account }) => {
    return {
        address: account.address,
        liquidBalance: account.liquidBalance,
        stakedAmount: account.stakedAmount,
        undelegationAmount: account.undelegationAmount,
        rewards: account.rewards,
        pools: account.pools,
        delegations: account.delegations,
        undelegations: account.undelegations,
        history: account.history,
        operation: account.operation,
    }
}

const accountInfo = [
    {
        title: 'Liquid balance',
        dataIndex: 'liquidBalance',
        render: val => val.gte(0) ? <span>{`${val.toFixed(5)} AION`}</span> :
            <Spin size='30px' width='2px' />
    },
    {
        title: 'Staked Amount',
        dataIndex: 'stakedAmount',
        render: val => val.gte(0) ? <span>{`${val.toFixed(5)} AION`}</span> :
            <Spin size='30px' width='2px' />
    },
    {
        title: 'Currently Undelegating',
        dataIndex: 'undelegationAmount',
        render: val => val.gte(0) ? <span>{`${val.toFixed(5)} AION`}</span> :
            <Spin size='30px' width='2px' />
    },
    {
        title: 'Total Rewards',
        dataIndex: 'rewards',
        render: val => val.gte(0) ? <span>{`${val.toFixed(5)} AION`}</span> :
            <Spin size='30px' width='2px' />
    }
]

const renderAccountInfo = (info, src) => {
    return (
        <div className='header-info'>
            {
                info.map(el => {
                    const { dataIndex, title, render } = el;
                    const val = src[dataIndex]
                    return (
                        <div key={title} className='header-info-item '>
                            <div className='header-info-item-value'>
                                {render(val)}
                            </div>
                            <div className='header-info-item-title'>{title}</div>
                        </div>
                    )
                })
            }
        </div>
    )
}

const home = (props: Ihome) => {
    const { history } = props;
    const account = useSelector(mapToState);
    const [poolLoading, setPoolLoading] = React.useState(false);
    const [myDelegationsLoading, setMyDelegationsLoading] = React.useState(false);
    const [undelegationsLoading, setUndelegationsLoading] = React.useState(false);
    const [transactionsLoading, setTransactionsLoading] = React.useState(false);
    const dispath = useDispatch();
    const { address, pools, delegations, undelegations, history: transactions } = account;
    const toDelegate = e => {
        e.preventDefault();
        dispath(createAction('account/update')({
            operation: {
                ...operation,
                type: operationType.delegate
            }
        }))
        history.push('/poollist');
    };
    const toWithDraw = e => {
        e.preventDefault();
        dispath(createAction('account/update')({
            operation: {
                ...operation,
                type: operationType.withdraw
            }
        }))
        history.push('/poollist');
    }
    const toPoolList = () => {
        dispath(createAction('account/update')({
            operation: {
                ...operation,
                type: operationType.default // reset operation
            }
        }))
        history.push('/poollist');
    }
    const toDelegations = () => {
        history.push('/delegations');
    }
    const toPendingUndlegation = () => {
        history.push('/pendingundelegation');
    }
    const toHistoryList = () => {
        history.push('/history');
    }
    const toPool = (pool) => {
        dispath(createAction('account/update')({
            operation: {
                ...operation,
                pool,
                type: operationType.default
            }
        }))
        history.push('/operation');
    }
    React.useEffect(() => {
        if (address !== '') {
            setPoolLoading(true)
            setMyDelegationsLoading(true)
            setUndelegationsLoading(true)
            setTransactionsLoading(true)
            wsSend({ method: 'eth_getBalance', params: [address] })
            wsSend({ method: 'delegations', params: [address, 0, 10] })
            wsSend({ method: 'transactions', params: [address, 0, 10] })
            wsSend({ method: 'pools', params: [] })
            wsSend({ method: 'undelegations', params: [address, 0, 10] })
        }
    }, [address])
    React.useEffect(() => {
        if (transactionsLoading) {
            setTransactionsLoading(false)
        }
    }, [transactions]);
    React.useEffect(() => {
        if (poolLoading) {
            setPoolLoading(false)
        }
    }, [pools]);
    React.useEffect(() => {
        if (undelegationsLoading) {
            setUndelegationsLoading(false)
        }
    }, [undelegations]);
    React.useEffect(() => {
        if (myDelegationsLoading) {
            setMyDelegationsLoading(false)
        }
    }, [delegations]);


    const renderPools = (title, lists_) => {
        const lists = Object.values(lists_).slice(0, 3);
        return (
            <Card
                title={title}
                lists={lists}
                renderItem={(el, key) => {
                    return <PoolItem key={key} pool={el} toPool={toPool} />
                }}
                handleMore={toPoolList}
            />
        )
    }

    const renderPoolsMore = (title, lists, info, handleMore) => {
        return (
            <Card
                title={title}
                lists={lists}
                renderItem={(el, key) => {
                    return <PoolItemMore key={key} pool={pools[el.poolAddress]} value={el} info={info} />
                }}
                handleMore={handleMore}
            />
        )
    }
    const renderTransaction = (title, lists, handleMore) => {
        return (
            <Card
                title={title}
                lists={lists}
                renderItem={(el, key) => {
                    return <TransactionItem key={key} pool={pools[el.pool]} transaction={el} />
                }}
                handleMore={handleMore}
            />
        )
    }


    const hasPools = Object.keys(pools).length > 0;
    const hasDelegations = Object.keys(delegations).length > 0;
    const hasUndelegations = Object.keys(undelegations).length > 0;
    const hasHistory = Object.keys(transactions).length > 0;
    const loading = poolLoading || myDelegationsLoading || undelegationsLoading || transactionsLoading;
    console.log(poolLoading, myDelegationsLoading,undelegationsLoading,transactionsLoading);
    return (
        <div className='flex-container'>
            <div className='home-header'>
                <div className='header-account'>
                    <span style={{ fontSize: '16px' }}>My Account:</span>&nbsp;
                    <span style={{ fontSize: '12px' }}>{`${formatAddress(address)}`}</span>
                    <CommonButton className='switch-account-button' title="switch" onClick={handleSwitchAccount} />
                </div>
                {renderAccountInfo(accountInfo, account)}
            </div>
            <div className='home-button-container'>
                <CommonButton className='home-button' title='Delegate' onClick={toDelegate} />
                <CommonButton className='home-button' title='Withdraw' onClick={toWithDraw} />
            </div>

            {!loading && hasPools && hasDelegations && renderPoolsMore('My Delegations', process_delegations(delegations).slice(0, 3), delegationInfo, toDelegations)}
            {!loading && hasPools && hasUndelegations && renderPoolsMore('Pending Undelegations', process_undelegations(undelegations).slice(0, 3), unDelegationInfo, toPendingUndlegation)}
            {!loading && hasPools && renderPools('Top pools', pools)}
            {!loading && hasPools && hasHistory && renderTransaction('Stake History', process_transctions(transactions).slice(0, 3), toHistoryList)}

            {loading &&
                <div style={{display:'flex', flex:1,alignItems:'center', justifyContent:'center'}}>
                    <Spin />
                </div>
            }

        </div>
    )
}

export default home;