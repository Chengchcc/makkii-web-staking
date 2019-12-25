import BigNumber from "bignumber.js";

export interface Idelegation {
    stake: BigNumber;
    rewards: BigNumber;
    auto_delegate_rewards: boolean;
}

export interface Iundelegation {
    blockNumber: number;
    amount: BigNumber;
    pool: String;
    timestamp: String;
}

export interface Ipool {
    // weight = (stakeTotal+stateSelf)/total_stake
    // capacity = stakeSelf*99
    address: string;
    stakeTotal: BigNumber;
    stakeSelf: BigNumber;
    fee: BigNumber;
    active: string;
    metaDataurl: string;
    posBlkTotal: BigNumber;
    stakeWeight: BigNumber;
    posWeight: BigNumber;
    performance: BigNumber;
    meta: {
        name: string;
        logo: string;
        url: string;
        tags?: Array<string>;
        version?: string;
    };
}
export interface Itransaction {
    type: string;
    amount: BigNumber;
    timestamp: string;
    pool: string;
    pool_to?: string;
    hash: string;
}

export interface Itransfer {
    amount: BigNumber;
    pool: string;
    pool_to: string;
}
