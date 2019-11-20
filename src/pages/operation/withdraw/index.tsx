import React from 'react'
import '../style.less';
import { useSelector } from 'react-redux';
import { operationType } from '@reducers/accountReducer';
import { formatAddress, validateAmount } from '@utils/index';
import { gas_withdraw, gasPrice, AIONDECIMAL } from '@utils/constants.json';
import BigNumber from 'bignumber.js';
import { CommonButton } from '@components/button';
import { call_withdraw } from '@utils/transaction';
import Modal, {alert} from '@components/modal'
import Image from '@components/default-img'
import {copyInputValue} from "@utils/util";
import i18n from '@utils/i18n';
import FormItem from '../operation_form_item';
import { commonGoback } from '../util';
import CheckMark from "@/img/checkMark.svg";

const fee_withdraw = new BigNumber(gas_withdraw).times(gasPrice).shiftedBy(AIONDECIMAL);

const maptoState = ({ account }) => {
    const { delegations, operation } = account;
    const delegation = delegations[operation.pool] || {};
    return {
        pools: account.pools,
        operation,
        account: {
            address: account.address,
            rewards: delegation.rewards || new BigNumber(0)
        }
    }
}



const withdraw = props => {
    const [modalState, setModalState] = React.useState({visible: false, txHash: ''});
    const { account, operation, pools } = useSelector(maptoState);
    const { history } = props;
    React.useEffect(()=>{
        if (operationType.withdraw !== operation.type) {
            history.replace('/operation')
        }
    },[operation])
    const pool = pools[operation.pool];
    const { meta } = pool;
    const { address, rewards } = account;
    const handle_withdraw = async (e: MouseEvent) => {
        e.preventDefault();
        const amount = rewards;
        const valid = validateAmount(amount);
        const insufficientBalance = new BigNumber(amount).gt(rewards);
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
        const res = await call_withdraw(operation.pool)
        if(res) {
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
        <div className='operation-container withdraw-form'>
            <FormItem label={i18n.t('operation_form.label_from')} className='operation-form-pool'>
                <Image src={meta.logo} className='pool-logo' alt="" />
                <span style={{marginLeft:'10px'}}>{meta.name || address}</span>
            </FormItem>
            <FormItem label={i18n.t('operation_form.label_to')}>{formatAddress(address)}</FormItem>
            <FormItem label={i18n.t('operation_form.label_tx_fee')}>
                ≈ {fee_withdraw.toFixed(5)} AION
            </FormItem>
            <FormItem label={i18n.t('operation_form.label_withdraw_amount')}>
                <span>{rewards.toFixed(5)}&nbsp; AION</span>
            </FormItem>
            <CommonButton title={i18n.t('operation.button_withdraw')} className="button-orange" onClick={handle_withdraw}/>
            <Modal
                visible={modalState.visible}
                title=""
                hide={hideModal}
                actions={[{title:<div className="button button-orange">{i18n.t('button_ok')}</div>, onPress:()=>{
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
withdraw.goBack = commonGoback;

export default withdraw
