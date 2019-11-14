import React from 'react';
import { Itransaction, Ipool } from '@interfaces/types';
import Image from '@components/default-img'
import './style.less';


interface ItransactionItem {
    pool: Ipool
    transaction: Itransaction
}

const tansferType = type => {
    switch (type) {
        case 'ADSDelegated':
            return 'Delegate:';
        case 'ADSUndelegated':
            return 'Undelegate:';
        case 'ADSWithdraw':
            return 'Withdraw:';
        default:
            return 'Normal:'
    }
}


const TransactionItem: React.FC<ItransactionItem> = props => {
    const { transaction, pool } = props;
    const { hash, type, amount } = transaction;
    const { meta } = pool;
    // const date = new Date(parseInt(timestamp, 16)*1000).Format('yyyy-MM-dd hh:mm', 24)
    return (
        <div className='transaction-item'>
           {/* <div className='transcation-item-header'>
                {formatTxHash(hash)}
            </div> */}
            <div className='transaction-info'>
                <div className='transaction-pool'>
                    <Image src={meta.logo} className='pool-logo' alt="" /> &nbsp;
                    <span>{meta.name || pool.address}</span>
                </div>
                <div>
                    <div className='transaction-pool-label'>{/* date */} Tx Hash: { `${hash.substring(0, 8)  }...${  hash.substring(60)}` }</div>
                    <div className='transaction-pool-label'>
                        <span>{tansferType(type)} </span>
                        <span>{`${amount.toFixed(5)} AION`}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TransactionItem
