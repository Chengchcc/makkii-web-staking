import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { operationType } from '@reducers/accountReducer';
import Bignumber from 'bignumber.js';
import { formatAddress, handleSwitchAccount } from '@utils/index';
import { CommonButton } from '@components/button';
import store, { createAction } from '@reducers/store';
import {alert} from '@components/modal';
import Image from '@components/default-img'
import i18n from '@utils/i18n';
import CommissionRateChangeList from "@pages/operation/commission_rate_change_list";
import './style.less';
import {wsSend} from "@utils/websocket";

const aionLogo = require("@/img/metaLogo2.png");


const mapToState = ({ account }) => {
    const poolAddress = account.operation.pool || "";
    const delegation = account.delegations[poolAddress] || {};
    return {
        operation: account.operation,
        pool: account.pools[poolAddress],
        account: account.address !== '' ? {
            address: account.address,
            stake: delegation.stake || new Bignumber(0),
            rewards: delegation.rewards || new Bignumber(0),
            commissionRateChanges: account.commissionRateChanges,
        } : undefined,
    };
}


const poolDetailInfo = [
    {
        title: 'operation.label_fees',
        dataIndex: 'fee',
        render: val => {
            return <span>{val.times(100).toFixed(4)}%</span>
        }
    },
    {
        title: 'operation.label_performance',
        dataIndex: 'performance',
        render: val => {
            const n = val.times(100).toFixed(2);
            // eslint-disable-next-line no-nested-ternary
            const text = n < 90 ? i18n.t('pool.label_poor') : n > 95 ? i18n.t('pool.label_excellent') : i18n.t('pool.label_moderate');

            return <span>{text}</span>
        }
    },
    {
        title: 'operation.label_stake_weight',
        dataIndex: 'stakeWeight',
        render: val => {
            return <span>{val.times(100).toFixed(4)}%</span>
        }
    },
    {
        title: 'operation.label_capacity',
        render: val => {
            return <span>{val.stakeSelf.times(100).minus(val.stakeTotal).toFixed(4)}</span>
        }
    },
    {
        title: 'operation.label_self_bond',
        dataIndex: 'stakeSelf',
        render: val => {
            return <span>{val.toNumber().toFixed(4)}</span>
        }
    },
    {
        title: 'operation.label_total_staked',
        dataIndex: 'stakeTotal',
        render: val => {
            return <span>{val.toNumber().toFixed(4)}</span>
        }
    }
]
const accountDetailInfo = [
    {
        title: 'operation.label_account_stake',
        dataIndex: 'stake',
        render: val => <><span>{`${val.toFixed(5)} `}</span><img src={aionLogo} width="16" height="16" alt=""/></>
    },
    {
        title: 'operation.label_account_rewards',
        dataIndex: 'rewards',
        render: val => <><span>{`${val.toFixed(5)} `}</span><img src={aionLogo} width="16" height="16" alt=""/></>
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
                    <div className='operation-pool-detail-item-title'>{i18n.t(title)}</div>
                </div>
            )
        }
        return (
            <div key={title} className='operation-pool-detail-item'>
                <div className='operation-pool-detail-item-value'>{val.toString()}</div>
                <div className='operation-pool-detail-item-title'>{i18n.t(title)}</div>
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
                    <div className='operation-account-info-title'>{i18n.t(title)}</div>
                </div>
            )
        }
        return (
            <div key={title} className='operation-account-info'>
                <div className='ooperation-account-info-value'>{val.toString()}</div>
                <div className='operation-account-info-title'>{i18n.t(title)}</div>
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
                    title:i18n.t('error_title'),
                    message: i18n.t('error_no_account'),
                    actions: [{
                        title: i18n.t('button_ok'),
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
            alert({
                title:i18n.t('error_title'),
                message: i18n.t('error_no_makkii'),
                actions: [{
                    title: i18n.t('button_ok'),
                    onPress: ()=>{
                        window.location.href = 'https://www.chaion.net/download/makkii_latest.apk'
                    }
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

        console.log("only execute once for operation not change")
        wsSend({method: "commission_rate_changes",
            params: [operation.pool, 0, 50]});
        return () => {
            store.dispatch(createAction("account/update")({commissionRateChanges: []}));
        };
    },[operation]);


    const accountLabel = () => {
        if (!account) return null;
        return (
            <div className='operation-account' >
                {renderAccountDetail(accountDetailInfo, account)}
                <CommonButton className='operation-button button-orange' title={i18n.t('operation.button_unDelegate')} onClick={toUndelegate} disabled={account.stake.toNumber() === 0}/>
                <CommonButton className='operation-button button-orange' title={i18n.t('operation.button_withdraw')} onClick={toWithdraw} disabled={account.rewards.toNumber() === 0}/>
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
                <div>
                    <Image src={logo} alt="" />
                </div>
                <ul>
                    {name&& <li>{name}</li>}
                    <li><span className={active === '0x01' ? 'poolActive' : 'poolInActive'} /> {
                        active === '0x01' ? i18n.t('pool.label_active') : i18n.t('pool.label_inActive')
                    }</li>
                    <li>{formatAddress(poolAddress)}</li>
                    {url && <li><a href={url} rel="noopener noreferrer">{url}</a></li> }
                </ul>
            </div>
            <div className="delimiter" />
            {accountLabel()}
            <div className='operation-pool-detail'>
                {renderPoolDetail(poolDetailInfo, pool)}
            </div>
            <CommonButton title={i18n.t('operation.button_delegate')} onClick={toDelegate} className='button-orange'/>
            <CommissionRateChangeList commissionRateChanges={account.commissionRateChanges} pool={pool}/>
        </div>
    )
}


export default Pageoperation


