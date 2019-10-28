import React from 'react'
import '../style.less';
import { useSelector } from 'react-redux';
import { operationType } from '@reducers/accountReducer';
import { formatAddress, validateAmount } from '@utils/index';
import { gas_withdraw, gasPrice, AIONDECIMAL } from '@utils/constants.json';
import BigNumber from 'bignumber.js';
import { CommonButton } from '@components/button';
import { call_withdraw } from '@utils/transaction';
import FormItem from '../operation_form_item';
import { commonGoback } from '../util';

const fee_withdraw = new BigNumber(gas_withdraw).times(gasPrice).shiftedBy(AIONDECIMAL);

const maptoState = ({ account }) => {
    const { delegations, operation } = account;
    const delegation = delegations[operation.pool] || {};
    return {
        pools: account.pools,
        operation,
        account: {
            address: account.address,
            reward: delegation.reward || new BigNumber(0)
        }
    }
}



const withdraw = props => {
    const { account, operation, pools } = useSelector(maptoState);
    const { history } = props;
    const [amount, setAmount] = React.useState('')
    React.useEffect(()=>{
        if (operationType.withdraw !== operation.type) {
            history.replace('/operation')
        }
    },[operation])
    const pool = pools[operation.pool];
    const { meta } = pool;
    const { address, reward } = account;
    const btnDisabled = validateAmount(amount);
    const handle_withdraw = (e: MouseEvent) => {
        e.preventDefault();
        // TODO handle withdraw
        if(btnDisabled) return;
        call_withdraw(operation.pool, amount)
    }
    return (
        <div className='operation-container'>
            <FormItem label='From' className='operation-form-pool'>
                <img src={meta.logo} className='pool-logo' alt="" />
                <span style={{marginLeft:'10px'}}>{meta.name}</span>
            </FormItem>
            <FormItem label='To'>{formatAddress(address)}</FormItem>
            <FormItem label='Withdraw'>
                <input value={amount} onChange={e => {
                    setAmount(e.target.value)
                }} /> &nbsp; AION  &nbsp;
                <a onClick={e => {
                    e.preventDefault();
                    setAmount(reward.minus(fee_withdraw).toString())
                }}>All</a>
            </FormItem>
            <FormItem label='Transaction Fee'>
                Approx. {fee_withdraw.toFixed(8)} AION
            </FormItem>
            <div style={{ padding: '20px 10px' }}>
                Rewards in this pools:  {reward.toString()} AION
            </div>
            <CommonButton title='withdraw' onClick={handle_withdraw} disabled={btnDisabled}/>
        </div>
    )
}
withdraw.goBack = commonGoback;

export default withdraw