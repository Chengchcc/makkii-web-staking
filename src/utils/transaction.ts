/* eslint-disable no-return-await */
import BigNumber from "bignumber.js";
import {
    gasPrice,
    gas_delegate,
    gas_withdraw,
    gas_undelegate,
    gas_transfer,
    gas_disable_auto_delegate,
    gas_enable_auto_delegate,
    POOL_REGISTRY_AMITY,
    POOL_REGISTRY_MAINNET,
    AIONDECIMAL
} from "@utils/constants.json";
import makkii from "makkii-webview-bridge";
import ABICoder from "@makkii/aion-web3-avm-abi";

declare const NETWORK: string;

const pool_address =
    NETWORK === "amity" ? POOL_REGISTRY_AMITY : POOL_REGISTRY_MAINNET;

const abi = new ABICoder();
const build_transaction = (
    to: string,
    gasPrice_: string,
    gasLimit: string,
    data: string,
    amount: string
) => {
    return {
        to,
        amount: new BigNumber(amount).shiftedBy(18).toFixed() || 0, // value.shiftedBy(18),
        type: 1,
        gasPrice: gasPrice_,
        gasLimit,
        data
    };
};

const sendTx = async tx => {
    console.log("sendTx=>", tx);
    try {
        return await makkii.sendTx(tx);
    } catch (error) {
        console.log("sendTx error", error);
        return false;
    }
};

export const call_delegate = async (pool, amount) => {
    const data = abi.encodeMethod("delegate", ["Address"], [pool]);

    // build tx
    const tx = build_transaction(
        pool_address,
        gasPrice.toFixed(),
        gas_delegate.toFixed(),
        data,
        new BigNumber(amount).shiftedBy(AIONDECIMAL).toFixed()
    );
    return await sendTx(tx);
};

export const call_withdraw = async pool => {
    const data = abi.encodeMethod("withdrawRewards", ["Address"], [pool]);

    // build tx
    const tx = build_transaction(
        pool_address,
        gasPrice.toFixed(),
        gas_withdraw.toFixed(),
        data,
        "0"
    );
    return await sendTx(tx);
};

export const call_undelegate = async (pool, amount, fee) => {
    const data = abi.encodeMethod(
        "undelegate",
        ["Address", "BigInteger", "BigInteger"],
        [
            pool,
            new BigNumber(amount).shiftedBy(-AIONDECIMAL).toFixed(),
            new BigNumber(fee).shiftedBy(-AIONDECIMAL).toFixed()
        ]
    );

    // build tx
    const tx = build_transaction(
        pool_address,
        gasPrice.toFixed(),
        gas_undelegate.toFixed(),
        data,
        "0"
    );
    return await sendTx(tx);
};

export const call_transfer = async (from, to, amount) => {
    const data = abi.encodeMethod(
        "transferDelegation",
        ["Address", "Address", "BigInteger", "BigInteger"],
        [from, to, new BigNumber(amount).shiftedBy(-AIONDECIMAL).toFixed(), 0]
    );
    // build tx
    const tx = build_transaction(
        pool_address,
        gasPrice.toFixed(),
        gas_transfer.toFixed(),
        data,
        "0"
    );
    return await sendTx(tx);
};

export const call_enable_auto_delegate = async (pool, feePercentage = 0) => {
    const data = abi.encodeMethod(
        "enableAutoRewardsDelegation",
        ["Address", "int"],
        [pool, feePercentage]
    );
    const tx = build_transaction(
        pool_address,
        gasPrice.toFixed(),
        gas_enable_auto_delegate.toFixed(),
        data,
        "0"
    );
    return await sendTx(tx);
};

export const call_disable_auto_delegate = async pool => {
    const data = abi.encodeMethod(
        "disableAutoRewardsDedelegation",
        ["Address"],
        [pool]
    );
    const tx = build_transaction(
        pool_address,
        gasPrice.toFixed(),
        gas_disable_auto_delegate.toFixed(),
        data,
        "0"
    );
    return await sendTx(tx);
};
