import React from 'react'
import '../style.less';
import { useSelector } from 'react-redux';
import { operationType } from '@reducers/accountReducer';
import { formatAddress, validateAmount } from '@utils/index';
import { gas_withdraw, gasPrice, AIONDECIMAL } from '@utils/constants.json';
import BigNumber from 'bignumber.js';
import { CommonButton } from '@components/button';
import { call_withdraw } from '@utils/transaction';
import {alert} from '@components/modal'
import Image from '@components/default-img'
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
    const inputRef = React.useRef(null)
    React.useEffect(()=>{
        if (operationType.withdraw !== operation.type) {
            history.replace('/operation')
        }
    },[operation])
    const pool = pools[operation.pool];
    const { meta } = pool;
    const { address, reward } = account;
    const handle_withdraw = async (e: MouseEvent) => {
        e.preventDefault();
        // TODO handle withdraw
        const amount = inputRef.current.value;
        const valid = validateAmount(amount);
        if(!valid  || parseFloat(amount) === 0) {
            alert({
                title: 'error', message: 'Invalid amount', actions: [
                    {
                        title: 'Ok',
                    },
                ]
            })
            return;
        }
        const res = await call_withdraw(operation.pool, amount)
        if(res) {
            // send success
        }else {
            // send fail
        }
    }
    return (
        <div className='operation-container'>
            <FormItem label='From' className='operation-form-pool'>
                <Image src={meta.logo} className='pool-logo' alt="" />
                <span style={{marginLeft:'10px'}}>{meta.name}</span>
            </FormItem>
            <FormItem label='To'>{formatAddress(address)}</FormItem>
            <FormItem label='Withdraw'>
                <input type='number' ref={inputRef} /> &nbsp; AION  &nbsp;
                <a onClick={e => {
                    e.preventDefault();
                    const amount = reward.minus(fee_withdraw);
                    inputRef.current.value = amount.gte(0)?reward.minus(fee_withdraw).toString():'0'
                }}>All</a>
            </FormItem>
            <FormItem label='Transaction Fee'>
                Approx. {fee_withdraw.toFixed(8)} AION
            </FormItem>
            <div style={{ padding: '20px 10px' }}>
                Rewards in this pools:  {reward.toString()} AION
            </div>
            <CommonButton title='withdraw' onClick={handle_withdraw}/>
        </div>
    )
}
withdraw.goBack = commonGoback;

export default withdraw