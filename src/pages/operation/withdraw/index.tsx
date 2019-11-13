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
        // TODO handle withdraw
        const amount = rewards;
        const valid = validateAmount(amount);
        const insufficientBalance = new BigNumber(amount).gt(rewards);
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
        <div className='operation-container'>
            <FormItem label='From' className='operation-form-pool'>
                <Image src={meta.logo} className='pool-logo' alt="" />
                <span style={{marginLeft:'10px'}}>{meta.name}</span>
            </FormItem>
            <FormItem label='To'>{formatAddress(address)}</FormItem>
            <FormItem label='Withdraw'>
                <span>{rewards.toString()}&nbsp; AION &nbsp;</span>
            </FormItem>
            <FormItem label='Transaction Fee'>
                Approx. {fee_withdraw.toFixed(5)} AION
            </FormItem>
            <CommonButton title='Withdraw' onClick={handle_withdraw}/>
            <Modal
                visible={modalState.visible}
                title=""
                hide={hideModal}
                actions={[{title:'Ok', onPress:()=>{
                    history.replace('/home');
                }}]}
                className='tx_result_modal'
            >
                <p>Transaction sent, waiting for block finalization.</p>
                <p>Transaction will be displayed only after finalization</p>
                <p>{modalState.txHash}</p>
                <p>TODO: 请加上复制按钮</p>
            </Modal>
        </div>
    )
}
withdraw.goBack = commonGoback;

export default withdraw