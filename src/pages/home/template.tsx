import React from "react";
import { Iinfo } from "@components/pool_item";
import Spin from "@components/spin";
import i18n from "@utils/i18n";
import { block_remain_to_time } from "@utils/index";
import store from "@reducers/store";

const logo = require("@img/metaLogo2.png");

export const delegationInfo: Array<Iinfo> = [
    {
        title: "delegations.label_stake",
        dataIndex: "stake",
        render: val => <span>{`${val.toFixed(5)} AION`}</span>
    },
    {
        title: "delegations.label_rewards",
        dataIndex: "rewards",
        render: val => <span>{`${val.toFixed(5)} AION`}</span>
    }
];

export const unDelegationInfo: Array<Iinfo> = [
    {
        title: "undelegations.label_blockNumber",
        dataIndex: "blockNumber",
        render: val => <span>{`#${val}`}</span>
    },
    {
        title: "undelegations.label_amount",
        dataIndex: "amount",
        render: val => <span>{`${val.toFixed(5)} AION`}</span>
    },
    {
        title: "undelegations.label_blockRemaining",
        dataIndex: "block_number_remaining",
        render: val => (
            <span>
                {[null, undefined].indexOf(val) > -1
                    ? i18n.t("estimating")
                    : `${val} ${block_remain_to_time(val)}`}
            </span>
        )
    }
];

export const accountInfo = [
    {
        title: "account.label_balance",
        dataIndex: "liquidBalance",
        render: val =>
            val.gte(0) ? (
                <>
                    <span>{`${val.toFixed(5)} `}</span>{" "}
                    <img src={logo} height="16" width="16" alt="" />
                </>
            ) : (
                <Spin size="30px" width="2px" />
            )
    },
    {
        title: "account.label_staked_amount",
        dataIndex: "stakedAmount",
        render: val =>
            val.gte(0) ? (
                <>
                    <span>{`${val.toFixed(5)} `}</span>
                    <img src={logo} height="16" width="16" alt="" />
                </>
            ) : (
                <Spin size="30px" width="2px" />
            )
    },
    {
        title: "account.label_undelegate_amount",
        dataIndex: "undelegationAmount",
        render: val =>
            val.gte(0) ? (
                <>
                    <span>{`${val.toFixed(5)} `}</span>{" "}
                    <img src={logo} height="16" width="16" alt="" />
                </>
            ) : (
                <Spin size="30px" width="2px" />
            )
    },
    {
        title: "account.label_rewards_amount",
        dataIndex: "rewards",
        render: val =>
            val.gte(0) ? (
                <>
                    <span>{`${val.toFixed(5)} `}</span>
                    <img src={logo} height="16" width="16" alt="" />
                </>
            ) : (
                <Spin size="30px" width="2px" />
            )
    }
];

export const process_delegations = delegations => {
    return Object.keys(delegations).reduce((arr, el) => {
        arr.push({
            ...delegations[el],
            poolAddress: el
        });
        return arr;
    }, []);
};

export const process_undelegations = undelegations => {
    return Object.keys(undelegations).reduce((arr, el) => {
        arr.push({
            ...undelegations[el],
            poolAddress: undelegations[el].pool
        });
        return arr;
    }, []);
};

export const process_transfers = transfers => {
    console.log("tra=>", transfers);
    const { pools } = store.getState().account;
    return Object.keys(transfers).reduce((arr, el) => {
        arr.push({
            amount: transfers[el].amount,
            pool_from: pools[transfers[el].pool],
            pool_to: pools[transfers[el].pool_to],
            type: "ADSDelegationTransferred"
        });
        return arr;
    }, []);
};

export const process_transctions = transctions => {
    return Object.values(transctions).sort(
        (a: any, b: any) => a.timestamp - b.timestamp
    );
};

export const process_transfer = transfer => {
    const { pools } = store.getState().account;
    return {
        amount: transfer.amount,
        pool_from: pools[transfer.pool],
        pool_to: pools[transfer.pool_to],
        type: transfer.type
    };
};
