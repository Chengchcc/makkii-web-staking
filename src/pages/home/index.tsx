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
import ReactPullLoad, { STATS } from '@components/pullLoad';
import { CommonButton } from '@components/button';
import Card from './card';
import './style.less';

const logo = require("@/img/metaLogo2.png")


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

export const process_delegations = (delegations) => {
    return Object.keys(delegations).reduce((arr, el) => {
        arr.push({
            ...delegations[el],
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
        render: val => val.gte(0) ? <><span>{`${val.toFixed(5)} `}</span> <img src={logo} height="16" width="16" alt="" /></> :
            <Spin size='30px' width='2px' />
    },
    {
        title: 'Staked Amount',
        dataIndex: 'stakedAmount',
        render: val => val.gte(0) ? <><span>{`${val.toFixed(5)} `}</span><img src={logo} height="16" width="16" alt="" /></> :
            <Spin size='30px' width='2px' />
    },
    {
        title: 'Currently Undelegating',
        dataIndex: 'undelegationAmount',
        render: val => val.gte(0) ? <><span>{`${val.toFixed(5)} `}</span> <img src={logo} height="16" width="16" alt="" /></> :
            <Spin size='30px' width='2px' />
    },
    {
        title: 'Total Rewards',
        dataIndex: 'rewards',
        render: val => val.gte(0) ? <><span>{`${val.toFixed(5)} `}</span><img src={logo} height="16" width="16" alt="" /></> :
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

let scrollTop = 0;

const home = (props: Ihome) => {
    const { history } = props;
    const account = useSelector(mapToState);
    const accountRef = React.useRef(account);
    const [state, setState] = React.useState({
        action: STATS.init,
        isLoading: false,
    })
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
                pool,
            }
        }))
        history.push('/operation');
    }


    const handleAction = action => {
        if (action === state.action ||
            action === STATS.refreshing && state.action === STATS.loading ||
            action === STATS.loading && state.action === STATS.refreshing) {
            // console.info("It's same action or on loading or on refreshing ",action, state.action,action === state.action);
            return
        }
        if (action === STATS.refreshing) {// refreshing
            // onRefresh();
            wsSend({ method: 'eth_getBalance', params: [address] })
            wsSend({ method: 'delegations', params: [address, 0, 10] })
            wsSend({ method: 'transactions', params: [address, 0, 10] })
            wsSend({ method: 'pools', params: [] })
            wsSend({ method: 'undelegations', params: [address, 0, 10] })
        } else if (action === STATS.loading) {// loading more
            // nothiing
        }
        // DO NOT modify below code
        setState({
            ...state,
            action
        })
    }
    React.useEffect(() => {
        if (!Object.keys(pools).length) {
            setState({
                ...state,
                isLoading: true,
            })
        }
    }, []);


    React.useEffect(() => {
        const { pools: pools_, delegations: delegations_, undelegations: undelegations_, history: transactions_ } = accountRef.current;
        if (pools_ !== pools && delegations_ !== delegations && undelegations_ !== undelegations && transactions_ !== transactions) {
            console.log('difference');
            const newState = { ...state };
            let update = false;
            if (state.isLoading) {
                newState.isLoading = false
                update = true;
            }
            if (state.action === STATS.refreshing) {
                newState.action = STATS.refreshed
                update = true;
            } else if (state.action === STATS.loading) {
                newState.action = STATS.reset
                update = true;
            }
            if (update) {
                setState(newState)
            }
            accountRef.current = account;
        }
    }, [pools, delegations, undelegations, transactions]);

    React.useEffect(() => {
        const element = document.getElementById('pullLoadContainer') || document.body;
        const handleScollTop = e => {
            scrollTop = e.target.scrollTop;
        };
        element.addEventListener('scroll', handleScollTop);
        if (scrollTop) {
            element.scrollTop = scrollTop;
        }
        return () => {
            element.removeEventListener('scroll', handleScollTop);
        }
    });

    const renderPools = (title, lists_) => {
        const sorter = (a: any, b: any) => {
            return b.performance.toNumber() - a.performance.toNumber();
        }

        const lists = Object.values(lists_).sort(sorter).slice(0, 3);
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
                    return <PoolItemMore key={key} pool={pools[el.poolAddress]} value={el} info={info} toPool={toPool} />
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
    return (
        <div className='flex-container'>
            <ReactPullLoad
                downEnough={100}
                isBlockContainer
                handleAction={handleAction}
                action={state.action}
                hasMore={false}
                FooterNode={() => <div />}
            >
                <div className='home-header'>
                    <div className='header-account'>
                        <span style={{ fontSize: '16px' }}>My Account:</span>
                        <span style={{ fontSize: '12px' }}>{`${formatAddress(address)}`}</span>
                        <CommonButton className='switch-account-button button-orange' title="Switch Account" onClick={handleSwitchAccount} />
                    </div>
                    {renderAccountInfo(accountInfo, account)}
                </div>
                <div className='home-button-container'>
                    <CommonButton className='home-button button-orange' title='Delegate' onClick={toDelegate} />
                    <CommonButton className='home-button button-orange' title='Withdraw' onClick={toWithDraw} disabled={account.rewards.isEqualTo(0)} />
                </div>
                {!state.isLoading ?
                    <>
                        {hasPools && hasDelegations && renderPoolsMore('My Delegations', process_delegations(delegations).slice(0, 3), delegationInfo, toDelegations)}
                        {hasPools && hasUndelegations && renderPoolsMore('Pending Undelegations', process_undelegations(undelegations).slice(0, 3), unDelegationInfo, toPendingUndlegation)}
                        {hasPools && renderPools('Top Pools', pools)}
                        {hasPools && hasHistory && renderTransaction('Stake History', process_transctions(transactions).slice(0, 3), toHistoryList)}
                    </> :
                    <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: '30' }}>
                        <Spin />
                    </div>
                }
            </ReactPullLoad>

        </div>
    )
}

export default home;
