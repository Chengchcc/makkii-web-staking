import React from 'react';
import { Itransaction, Ipool } from '@interfaces/types';
import { formatTxHash } from '@utils/index'
import './style.less';


interface ItransactionItem {
    pool: Ipool
    transaction: Itransaction
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
    const { hash, type, amount, timestamp } = transaction;
    const { meta } = pool;
    const date = new Date(parseInt(timestamp, 16)*1000).Format('yyyy-MM-dd hh:mm', 24)
    return (
        <div className='transaction-item'>
            <div className='transcation-item-header'>
                {formatTxHash(hash)}
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
                        <span>{`${amount} AION`}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TransactionItem