import React from 'react'
import '../style.less';
import { useSelector } from 'react-redux';
import { operationType } from '@reducers/accountReducer';
import { formatAddress } from '@utils/index';
import {gas_undelegate, gasPrice, AIONDECIMAL, period_block} from '@utils/constants.json';
import BigNumber from 'bignumber.js';
import { CommonButton } from '@components/button';
import FormItem from '../operation_form_item';
import { commonGoback } from '../util';

const fee_delegate = new BigNumber(gas_undelegate).times(gasPrice).shiftedBy(AIONDECIMAL);

const maptoState = ({ account }) => {
    const { delegations, operation } = account;
    const delegation = delegations[operation.pool] || {};
    return {
        pools: account.pools,
        operation,
        account: {
            address: account.address,
            staked: delegation.stake || new BigNumber(0)
        }
    }

}



const undelegate = props => {
    const { account, operation, pools } = useSelector(maptoState);
    const { history } = props;
    const [amount, setAmount] = React.useState('')
    React.useEffect(()=>{
        if (operationType.undelegate !== operation.type) {
            history.replace('/operation')
        }
    },[operation])
    const pool = pools[operation.pool];
    const { meta } = pool;
    const { address, staked } = account;
    const handel_undelegate = (e: MouseEvent)=>{
        e.preventDefault();
        // TODO handel undelegate
    }
    return (
        <div className='operation-container'>
            <FormItem label='From' className='operation-form-pool'>
                <img src={meta.logo} className='pool-logo' alt="" />
                <span style={{marginLeft:'10px'}}>{meta.name}</span>
            </FormItem>
            <FormItem label='To'>{formatAddress(address)}</FormItem>
            <FormItem label='Lock Period'>{`${period_block} blocks`}</FormItem>
            <FormItem label='Undelegate Amount'>
                <input value={amount} onChange={e=>{
                    setAmount(e.target.value)
                }}/> &nbsp; AION  &nbsp;
                <a onClick={e=>{
                    e.preventDefault();
                    setAmount(staked.minus(fee_delegate).toString())
                }}>All</a>
            </FormItem>
            <FormItem label='Transaction Fee'>
                Approx. {fee_delegate.toFixed(8)} AION
            </FormItem>
            <div style={{padding:'20px 10px'}}>
                You have delegated {staked.toString()} AION to this pool
            </div>
            <CommonButton title='undelegate' onClick={handel_undelegate}/>
        </div>
    )
}
undelegate.goBack = commonGoback;

export default undelegate