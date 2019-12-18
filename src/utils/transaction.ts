/* eslint-disable no-return-await */
import BigNumber from "bignumber.js";
import {
    gasPrice,
    gas_delegate,
    gas_withdraw,
    gas_undelegate,
    POOL_REGISTRY_AMITY,
    POOL_REGISTRY_MAINNET,
    AIONDECIMAL
} from "@utils/constants.json";
import makkii from "makkii-webview-bridge";
import ABICoder from "../libs/aion-web3-avm-abi";

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
