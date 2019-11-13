import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { operationType } from '@reducers/accountReducer';
import Bignumber from 'bignumber.js';
import './style.less';
import { formatAddress, handleSwitchAccount } from '@utils/index';
import { CommonButton } from '@components/button';
import { createAction } from '@reducers/store';
import {alert} from '@components/modal';
import Image from '@components/default-img'

const mapToState = ({ account }) => {
    const poolAddress = account.operation.pool || "";
    const delegation = account.delegations[poolAddress] || {};
    return {
        operation: account.operation,
        pool: account.pools[poolAddress],
        account: account.address !== '' ? {
            address: account.address,
            stake: delegation.stake || new Bignumber(0),
            rewards: delegation.rewards || new Bignumber(0)
        } : undefined
    }
}


const poolDetailInfo = [
    {
        title: 'Fees',
        dataIndex: 'fee',
        render: val => {
            return <span>{val.times(100).toFixed(4)} %</span>
        }
    },
    {
        title: 'Performance',
        dataIndex: 'performance',
        render: val => {
            const n = val.times(100).toFixed(2);
            // eslint-disable-next-line no-nested-ternary
            const [color, text] = n < 90 ? ['red', 'Poor'] : n > 95 ? ['green', 'Excellent'] : ['#ff9910', 'Moderate'];

            return <span>{text}</span>
        }
    },
    {
        title: 'Stake Weight',
        dataIndex: 'stakeWeight',
        render: val => {
            return <span>{val.times(100).toFixed(4)} %</span>
        }
    },
    {
        title: 'Capacity',
        render: val => {
            return <span>{val.stakeSelf.times(100).minus(val.stakeTotal).toFixed(4)}</span>
        }
    },
    {
        title: 'Self Bond',
        dataIndex: 'stakeSelf',
        render: val => {
            return <span>{val.toNumber().toFixed(4)}</span>
        }
    },
    {
        title: 'Total Staked',
        dataIndex: 'stakeTotal',
        render: val => {
            return <span>{val.toNumber().toFixed(4)}</span>
        }
    }
]

const accountDetailInfo = [
    {
        title: 'Amount delegated to this pool',
        dataIndex: 'stake',
        render: val => <span>{`${val.toFixed(5)} AION`}</span>
    },
    {
        title: 'Rewards earned in this pool',
        dataIndex: 'rewards',
        render: val => <span>{`${val.toFixed(5)} AION`}</span>
    }
]


const renderPoolDetail = (info, src) => {

    return info.map(el => {
        const { dataIndex, title, render } = el;
        const val = dataIndex ? src[dataIndex] : src;
        if (render) {
            return (
                <div key={title} className='operation-pool-detail-item'>
                    <div className='operation-pool-detail-item-value'>{render(val)}</div>
                    <div className='operation-pool-detail-item-title'>{title}</div>
                </div>
            )
        }
        return (
            <div key={title} className='operation-pool-detail-item'>
                <div className='operation-pool-detail-item-value'>{val.toString()}</div>
                <div className='operation-pool-detail-item-title'>{title}</div>
            </div>
        )
    })
}

const renderAccountDetail = (info, src) => {
    return info.map(el => {
        const { dataIndex, title, render } = el;
        const val = dataIndex ? src[dataIndex] : src;
        if (render) {
            return (
                <div key={title} className='operation-account-info'>
                    <div className='operation-account-info-value'>{render(val)}</div>
                    <div className='operation-account-info-title'>{title}</div>
                </div>
            )
        }
        return (
            <div key={title} className='operation-account-info'>
                <div className='ooperation-account-info-value'>{val.toString()}</div>
                <div className='operation-account-info-title'>{title}</div>
            </div>
        )
    })
}

const Pageoperation = props => {
    const { operation, account, pool } = useSelector(mapToState);
    const dispatch = useDispatch();
    const { history } = props;

    const toDelegate = () => {
        const {makkii} = window;
        if(makkii.isconnect()){
            if(!account) {
                alert({
                    title:'error',
                    message: 'Please import an account first',
                    actions: [{
                        title: 'Ok',
                        onPress: handleSwitchAccount
                    }]
                })
            }else {
                dispatch(createAction('account/update')({
                    operation: {
                        ...operation,
                        type: operationType.delegate
                    }
                }));
                history.push('/delegate')
            }

        }else{
            // TODO no makkii
            alert({
                title:'error',
                message: 'Please open by Makkii',
                actions: [{
                    title: 'Ok'
                }]
            })
        }

    }

    const toUndelegate = () => {
        dispatch(createAction('account/update')({
            operation: {
                ...operation,
                type: operationType.undelegate
            }
        }));
        history.push('/undelegate')
    }

    const toWithdraw = () => {
        dispatch(createAction('account/update')({
            operation: {
                ...operation,
                type: operationType.withdraw
            }
        }));
        history.push('/withdraw')
    }

    React.useEffect(()=>{
        if (!operation.pool) {
            history.replace('/poolList')
        }
    },[operation])


    const accountLabel = () => {
        if (!account) return null;
        console.log("aaa", account);
        return (
            <div className='operation-account' >
                {renderAccountDetail(accountDetailInfo, account)}
                <CommonButton className='operation-button' title='Un-delegate' onClick={toUndelegate} disabled={account.stake.toNumber() === 0}/>
                <CommonButton className='operation-button' title='Withdraw' onClick={toWithdraw} disabled={account.rewards.toNumber() === 0}/>
            </div>
        )
    }
    if(!operation.pool){
        return <div/>;
    }

    const { meta: { logo, name, url }, active, address: poolAddress } = pool;


    return (
        <div className='operation-container'>
            <div className='operation-pool-basic'>
                <Image src={logo} alt="" />
                <ul>
                    {name&& <li>{name}</li>}
                    <li><span className={active === '0x01' ? 'poolActive' : 'poolInActive'} /> {
                        active === '0x01' ? 'Active' : 'Inactive'
                    }</li>
                    <li>{formatAddress(poolAddress)}</li>
                    {url && <li><a href={url} target='_blank' rel="noopener noreferrer">{url}</a></li> }
                </ul>
            </div>
            <div className="delimiter" />
            {accountLabel()}
            <div className='operation-pool-detail'>
                {renderPoolDetail(poolDetailInfo, pool)}
            </div>
            <CommonButton title='Delegate' onClick={toDelegate} />
        </div>
    )
}


export default Pageoperation


