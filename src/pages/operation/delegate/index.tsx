import React from 'react'
import '../style.less';
import { useSelector } from 'react-redux';
import { operationType } from '@reducers/accountReducer';
import { formatAddress, validateAmount } from '@utils/index';
import {gas_delegate, gasPrice, AIONDECIMAL} from '@utils/constants.json';
import BigNumber from 'bignumber.js';
import { CommonButton } from '@components/button';
import {call_delegate} from '@utils/transaction';
import FormItem from '../operation_form_item';
import { commonGoback } from '../util';

const fee_delegate = new BigNumber(gas_delegate).times(gasPrice).shiftedBy(AIONDECIMAL);

const maptoState = ({ account }) => {

    return {
        pools: account.pools,
        operation: account.operation,
        account: {
            address: account.address,
            balance: account.liquidBalance,
        }
    }

}



const delegate = props => {
    const { account, operation, pools } = useSelector(maptoState);
    const { history } = props;
    const [amount, setAmount] = React.useState('')
    React.useEffect(()=>{
        if (operationType.delegate !== operation.type) {
            history.replace('/operation')
        }
    },[operation])
    const pool = pools[operation.pool];
    const { meta } = pool;
    const { address, balance } = account;
    const btnDisabled =  !validateAmount(amount);
    const handle_delegate = (e: MouseEvent)=>{
        e.preventDefault();
        if(btnDisabled) return;
        const tx = call_delegate(operation.pool, amount);
        console.log('delegate Tx=>', tx);
        // TODO handle delegate
    }
    return (
        <div className='operation-container'>
            <FormItem label='From'>{formatAddress(address)}</FormItem>
            <FormItem label='To' className='operation-form-pool'>
                <img src={meta.logo} className='pool-logo' alt="" />
                <span style={{marginLeft:'10px'}}>{meta.name}</span>
            </FormItem>
            <FormItem label='Delegate Amount'>
                <input value={amount} onChange={e=>{
                    setAmount(e.target.value)
                }}/> &nbsp; AION  &nbsp;
                <a onClick={e=>{
                    e.preventDefault();
                    setAmount(balance.minus(fee_delegate).toString())
                }}>All</a>
            </FormItem>
            <FormItem label='Transaction Fee'>
                Approx. {fee_delegate.toFixed(8)} AION
            </FormItem>
            <div style={{padding:'20px 10px'}}>
             Your liquid amount is {balance.toString()} AION.
            </div>
            <CommonButton title='delegate' onClick={handle_delegate} disabled={btnDisabled}/>
        </div>
    )
}
delegate.goBack = commonGoback;

export default delegate