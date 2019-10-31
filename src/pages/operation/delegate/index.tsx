import React from 'react'
import '../style.less';
import { useSelector } from 'react-redux';
import { operationType } from '@reducers/accountReducer';
import { formatAddress, validateAmount } from '@utils/index';
import { gas_delegate, gasPrice, AIONDECIMAL } from '@utils/constants.json';
import BigNumber from 'bignumber.js';
import { CommonButton } from '@components/button';
import { call_delegate } from '@utils/transaction';
import { alert } from '@components/modal';
import Image from '@components/default-img'
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
    const inputRef = React.useRef(null);
    React.useEffect(() => {
        if (operationType.delegate !== operation.type) {
            history.replace('/operation')
        }
    }, [operation])
    const pool = pools[operation.pool];
    const { meta } = pool;
    const { address, balance } = account;
    const handle_delegate = async (e: MouseEvent) => {
        e.preventDefault();
        // TODO handle delegate
        const amount = inputRef.current.value;
        const valid = validateAmount(amount);
        const insufficientBalance = new BigNumber(amount).plus(fee_delegate).gt(balance);
        if (!valid || parseFloat(amount) === 0 || insufficientBalance) {
            alert({
                title: 'error', message: 'Invalid amount', actions: [
                    {
                        title: 'Ok',
                    },
                ]
            })
            return;
        }
        const res = await call_delegate(operation.pool, amount);
        if (res) {
            // send succss
            console.log('delegate Tx=>', res);

        } else {
            // send fail
        }
    }
    return (
        <div className='operation-container'>
            <FormItem label='From'>{formatAddress(address)}</FormItem>
            <FormItem label='To' className='operation-form-pool'>
                <Image src={meta.logo} className='pool-logo' alt="" />
                <span style={{ marginLeft: '10px' }}>{meta.name}</span>
            </FormItem>
            <FormItem label='Delegate Amount'>
                <input ref={inputRef} type='number' /> &nbsp; AION  &nbsp;
                <a onClick={e => {
                    e.preventDefault();
                    const amount = balance.minus(fee_delegate);
                    inputRef.current.value = amount.gte(0) ? balance.minus(fee_delegate).toString() : '0'
                }}>All</a>
            </FormItem>
            <FormItem label='Transaction Fee'>
                Approx. {fee_delegate.toFixed(8)} AION
            </FormItem>
            <div style={{ padding: '20px 10px' }}>
                Your liquid amount is {balance.toString()} AION.
            </div>
            <CommonButton title='delegate' onClick={handle_delegate} />

        </div>

    )
}
delegate.goBack = commonGoback;

export default delegate