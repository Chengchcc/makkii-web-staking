import React from 'react'
import '../style.less';
import { useSelector } from 'react-redux';
import { operationType } from '@reducers/accountReducer';
import { formatAddress, validateAmount } from '@utils/index';
import {gas_undelegate, gasPrice, AIONDECIMAL, period_block} from '@utils/constants.json';
import BigNumber from 'bignumber.js';
import { CommonButton } from '@components/button';
import { call_undelegate } from '@utils/transaction';
import {alert} from '@components/modal'
import Image from '@components/default-img'
import FormItem from '../operation_form_item';
import { commonGoback } from '../util';
import Modal from '@components/modal';
import {copyInputValue} from "@utils/util";

const fee_undelegate = new BigNumber(gas_undelegate).times(gasPrice).shiftedBy(AIONDECIMAL);

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
    const [modalState, setModalState] = React.useState({visible: false, txHash: ''});
    const { account, operation, pools } = useSelector(maptoState);
    const { history } = props;
    const inputRef = React.useRef(null);
    React.useEffect(()=>{
        if (operationType.undelegate !== operation.type) {
            history.replace('/operation')
        }
    },[operation])
    const pool = pools[operation.pool];
    const { meta } = pool;
    const { address, staked } = account;
    const handle_undelegate = async (e: MouseEvent)=>{
        e.preventDefault();
        // TODO handle undelegate
        const amount = inputRef.current.value;
        const valid = validateAmount(amount);
        const insufficientBalance = new BigNumber(amount).gt(staked);
        if(!valid  || parseFloat(amount) === 0 || insufficientBalance) {
            alert({
                title: 'error', message: 'Invalid amount', actions: [
                    {
                        title: 'Ok',
                    },
                ]
            })
            return;
        }
        const res = await call_undelegate(operation.pool, amount, 0)
        if(res){
            // send success
            setModalState({
                visible: true,
                txHash: res
            });
        }else {
            // send fail
            alert({
                title: 'error', message: 'Sent fail', actions: [
                    {
                        title: 'Ok',
                    },
                ]
            })
        }
    }
    const hideModal = ()=> {
        setModalState({
            visible: false,
            txHash: ''
        });
    }
    return (
        <div className='operation-container undelegate-form'>
            <FormItem label='From' className='operation-form-pool'>
                <Image src={meta.logo} className='pool-logo' alt="" />
                <span style={{marginLeft:'10px'}}>{meta.name || address}</span>
            </FormItem>
            <FormItem label='To'>{formatAddress(address)}</FormItem>
            <FormItem label='Transaction Fee'>
                ≈ {fee_undelegate.toFixed(5)} AION
            </FormItem>
            <FormItem label='Lock Period'>{`${period_block} blocks`}</FormItem>
            <FormItem label="Delegated Amount">
                {staked.toFixed(5)} AION
            </FormItem>
            <FormItem label='Undelegate Amount' className="undelegate-input">
                <input type='number' ref={inputRef} /> &nbsp; AION  &nbsp;
                <a onClick={e=>{
                    e.preventDefault();
                    const amount = staked.minus(fee_undelegate);
                    inputRef.current.value = amount.gte(0)?staked.minus(fee_undelegate).toString():'0'
                }}>All</a>
            </FormItem>
            <CommonButton title='Undelegate' className='button-orange' onClick={handle_undelegate} />
            <Modal
                visible={modalState.visible}
                title={''}
                hide={hideModal}
                actions={[{title: <div className="button button-orange">OK</div>, onPress:()=>{
                    history.replace('/home');
                }}]}
                className='tx_result_modal'
            >
                <p>Transaction sent, waiting for block finalization.</p>
                <p><span>{modalState.txHash}</span><div className="button button-blue" onClick={() => {
                    copyInputValue(modalState.txHash); }}>Copy</div></p>
            </Modal>
        </div>
    )
}
undelegate.goBack = commonGoback;

export default undelegate
