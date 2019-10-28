/* eslint-disable no-return-await */
import BigNumber from 'bignumber.js'
import {gasPrice, gas_delegate, gas_withdraw, gas_undelegate, POOL_REGISTRY, AIONDECIMAL} from '@utils/constants.json';
import ABICoder from '../libs/web3-avm-abi'


const abi = new ABICoder()
const {makkii} = window;
const build_transaction = (to:string, gasPrice_:string, gasLimit:string, data:string, amount:string)=>{
    return {
        to,
        amount: new BigNumber(amount).shiftedBy(18).toFixed() || 0, // value.shiftedBy(18),
        type: 1,
        gasPrice:gasPrice_,
        gasLimit,
        data
    }
}

const sendTx = async (tx) => {
    console.log('sendTx=>', tx);
    try{
       return await makkii.sendTx(tx)
    }catch(error) {
        console.log('sendTx error', error)
        return false
    }

}

export const call_delegate = async (pool, amount) => {
    const data = abi.encodeMethod(
        'delegate',
        [
            'Address'
        ],
        [
            pool
        ]
    );

    // build tx
    const tx = build_transaction(
        POOL_REGISTRY,
        gasPrice.toFixed(),
        gas_delegate.toFixed(),
        data,
        new BigNumber(amount).shiftedBy(AIONDECIMAL).toFixed()
    )
    // TODO call makkii
    return await sendTx(tx);
}

export const call_withdraw = async (pool, amount) => {
    const data = abi.encodeMethod(
        'withdraw',
        [
            'Address'
        ],
        [
            pool
        ])

    // build tx
    const tx = build_transaction(
        POOL_REGISTRY,
        gasPrice.toFixed(),
        gas_withdraw.toFixed(),
        data,
        new BigNumber(amount).shiftedBy(AIONDECIMAL).toFixed()
    )
    // TODO call makkii
    return await sendTx(tx);
}


export const call_undelegate = async (pool, amount, fee) => {
    const data = abi.encodeMethod(
        'undelegate',
        [
            'Address',
            'BigInteger',
            'BigInteger'
        ],
        [
            pool,
            new BigNumber(amount).shiftedBy(AIONDECIMAL).toFixed(),
            new BigNumber(fee).shiftedBy(AIONDECIMAL).toFixed()
        ]
    )

    // build tx
    const tx = build_transaction(
        POOL_REGISTRY,
        gasPrice.toFixed(),
        gas_undelegate.toFixed(),
        data,
        new BigNumber(amount).shiftedBy(AIONDECIMAL).toFixed()
    )
    // TODO call makkii
    return await sendTx(tx);
}