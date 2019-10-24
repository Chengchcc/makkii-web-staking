import React from 'react';
import { Itransaction, Ipool } from '@interfaces/types';
import { formatTxHash } from '@utils/index'
import './style.less';

interface Itransaction2 extends Itransaction {
    txhash: string
}
interface ItransactionItem {
    pool: Ipool
    transaction: Itransaction2
}

const tansferType = type => {
    switch (type) {
        case 'ADSDelegated':
            return 'Delegation';
        case 'ADSUndelegated':
            return 'Undelegation';
        case 'ADSWithdraw':
            return 'Withdraw';
        default:
            return 'Normal'
    }
}


const TransactionItem: React.FC<ItransactionItem> = props => {
    const { transaction, pool } = props;
    const { txhash, type, amount, timestamp } = transaction;
    const { meta } = pool;
    const date = new Date(parseInt(timestamp, 16)).Format('yyyy-MM-dd hh:mm', 24)
    return (
        <div className='transaction-item'>
            <div className='transcation-item-header'>
                {formatTxHash(txhash)}
            </div>
            <div className='transaction-info'>
                <div className='transaction-pool'>
                    <img src={meta.logo} className='pool-logo' alt="" /> &nbsp;
                    {meta.name}
                </div>
                <div>
                    <div className='transaction-pool-label'>{date}</div>
                    <div className='transaction-pool-label'>
                        <span>{tansferType(type)} </span>
                        <span>{`${amount} Aion`}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TransactionItem