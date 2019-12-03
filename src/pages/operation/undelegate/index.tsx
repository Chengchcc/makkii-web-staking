import React from 'react'
import '../style.less';
import { useSelector } from 'react-redux';
import { operationType } from '@reducers/accountReducer';
import { formatAddress, validateAmount } from '@utils/index';
import {gas_undelegate, gasPrice, AIONDECIMAL, period_block} from '@utils/constants.json';
import BigNumber from 'bignumber.js';
import { CommonButton } from '@components/button';
import { call_undelegate } from '@utils/transaction';
import Modal, {alert} from '@components/modal'
import Image from '@components/default-img'
import {copyInputValue} from "@utils/util";
import i18n from '@utils/i18n';
import FormItem from '../operation_form_item';
import { commonGoback } from '../util';
import { send_event_log } from '@utils/httpclient';

import CheckMark from "@/img/checkMark.svg";

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
        const amount = inputRef.current.value;
        const valid = validateAmount(amount);
        const insufficientBalance = new BigNumber(amount).gt(staked);
        if(!valid  || parseFloat(amount) === 0 || insufficientBalance) {
            alert({
                title: i18n.t('error_title'), message: 'Invalid amount', actions: [
                    {
                        title: i18n.t('button_ok'),
                    },
                ]
            })
            return;
        }
        const res = await call_undelegate(operation.pool, amount, 0)
        if(res){

            send_event_log({
                user: 'staking',
                event: 'STAKING_UNDELEGATE',
                data: {
                    amount: amount,
                    pool_address: operation.pool,
                    pool_name: meta.name,
                }
            });

            // send success
            setModalState({
                visible: true,
                txHash: res
            });
        }else {
            // send fail
            alert({
                title: i18n.t('error_title'), message: i18n.t('error_sent_fail'), actions: [
                    {
                        title: i18n.t('button_ok'),
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
            <FormItem label={i18n.t('operation_form.label_from')} className='operation-form-pool'>
                <Image src={meta.logo} className='pool-logo' alt="" />
                <span style={{marginLeft:'10px'}}>{meta.name || address}</span>
            </FormItem>
            <FormItem label={i18n.t('operation_form.label_to')}>{formatAddress(address)}</FormItem>
            <FormItem label={i18n.t('operation_form.label_tx_fee')}>
                ≈ {fee_undelegate.toFixed(5)} AION
            </FormItem>
            <FormItem label={i18n.t('operation_form.label_lock_period')}>{`${period_block} ${i18n.t('unit_block')} ≈ 1 ${i18n.t('unit_day')}`}</FormItem>
            <FormItem label={i18n.t('operation_form.label_delegate_amount')}>
                {staked.toFixed(5)} AION
            </FormItem>
            <FormItem label={i18n.t('operation_form.label_undelegate_amount')} className="undelegate-input">
                <input type='number' ref={inputRef} /> &nbsp; AION  &nbsp;
                <a className="button button-orange" onClick={e=>{
                    e.preventDefault();
                    const amount = staked.minus(fee_undelegate);
                    inputRef.current.value = amount.gte(0)?staked.toString():'0'
                }}>{i18n.t('button_all')}</a>
            </FormItem>
            <CommonButton title={i18n.t('operation.button_unDelegate')} className='button-orange' onClick={handle_undelegate} />
            <Modal
                visible={modalState.visible}
                title=""
                hide={hideModal}
                actions={[{title: <div className="button button-orange">{i18n.t('button_ok')}</div>, onPress:()=>{
                    history.replace('/home');
                }}]}
                className='tx_result_modal'
            >
                <CheckMark width={40} height={40}/>
                <p>{i18n.t("modal.sent_success_msg1")}<br/>{i18n.t("modal.sent_success_msg2")}</p>
                <p>{i18n.t("modal.sent_success_msg3")}</p>
                <p>
                    {formatAddress(modalState.txHash)}
                    <img src={require("@/img/copy2.png")} onClick={() => {
                        copyInputValue(modalState.txHash);
                    }} alt=""/></p>
            </Modal>
        </div>
    )
}
undelegate.goBack = commonGoback;

export default undelegate
