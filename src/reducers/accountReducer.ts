/* eslint-disable no-param-reassign */
import {
    Idelegation,
    Iundelegation,
    Ipool,
    Itransaction,
    Itransfer
} from "@interfaces/index";
import BigNumber from "bignumber.js";
import { deepMergeObject } from "@utils/index";

export enum operationType {
    delegate,
    withdraw,
    undelegate,
    default
}
export interface IAccountState {
    address: string;
    liquidBalance: BigNumber;
    stakedAmount: BigNumber;
    undelegationAmount: BigNumber;
    rewards: BigNumber;
    delegations: { [poolAddres: string]: Idelegation };
    delegationsPagination: { current: number; total: number };
    undelegationsPagination: { current: number; total: number };
    historyPagination: { current: number; total: number };
    undelegations: { [poolAddres: string]: Iundelegation };
    delegationTransfers: { [id: string]: Itransfer };
    delegationTransfersPagination: { current: number; total: number };
    pools: { [poolAddres: string]: Ipool };
    history: { [hash: string]: Itransaction };
    operation: {
        pool: string;
        type: operationType | string;
    };
    block_number_last: number;
    commissionRateChanges: any[];
}
const defaultState2: IAccountState = {
    address:
        "0xa095541186b2e53698244e231274a0754678664d2655d0e233aa3b9a03d21ef4",
    liquidBalance: new BigNumber(-1),
    stakedAmount: new BigNumber(-1),
    undelegationAmount: new BigNumber(-1),
    rewards: new BigNumber(-1),
    delegations: {},
    undelegations: {},
    pools: {},
    history: {},
    delegationTransfers: {},
    delegationsPagination: { current: 0, total: 0 },
    undelegationsPagination: { current: 0, total: 0 },
    historyPagination: { current: 0, total: 0 },
    delegationTransfersPagination: { current: 0, total: 0 },
    operation: {
        pool: "",
        type: operationType.default
    },
    block_number_last: 0,
    commissionRateChanges: []
};
// const defaultState: IAccountState = {
//     address: '',
//     liquidBalance: new BigNumber(100),
//     stakedAmount: new BigNumber(200),
//     undelegationAmount: new BigNumber(300),
//     rewards: new BigNumber(400),
//     delegationsPagination:{current:0, total:0},
//     undelegationsPagination:{current:0, total:0},
//     historyPagination:{current:0, total:0},
//     delegations: {
//         '0xa0c0792c2d2e97d6907b42440ffe64181080cdff145f70c6c2a3c5379a7d744a':{
//             stake: new BigNumber(100),
//             rewards: new BigNumber(299),
//         },
//         '0xa0df2de13945675e009445e8bc6f3ec2f0a54262a6dc78c76c1a58e333322b64':{
//             stake: new BigNumber(200),
//             rewards: new BigNumber(399),
//         },
//     },
//     undelegations: {
//         '1':{
//             blockNumber: 12345,
//             amount: new BigNumber(100),
//             pool: '0xa0c0792c2d2e97d6907b42440ffe64181080cdff145f70c6c2a3c5379a7d744a',
//             timestamp: '16dec7fe694',
//         },
//         '2':{
//             blockNumber: 12345,
//             amount: new BigNumber(130),
//             pool: '0xa0df2de13945675e009445e8bc6f3ec2f0a54262a6dc78c76c1a58e333322b64',
//             timestamp: '16dec7fe594',
//         },
//     },
//     pools: {
//         '0xa0c0792c2d2e97d6907b42440ffe64181080cdff145f70c6c2a3c5379a7d744a': {
//             active: "0x01",
//             address: "0xa0c0792c2d2e97d6907b42440ffe64181080cdff145f70c6c2a3c5379a7d744a",
//             fee: new BigNumber(100).shiftedBy(-6),
//             meta: { name: "5mpj", logo: "https://s3.amazonaws.com/keybase_processed_uploads/85a48000fca5fb9c255fc260274f5605_360_360.jpg", url: "" },
//             metaDataurl: "https://mindfulstaking.com",
//             posBlkTotal: new BigNumber(100),
//             stakeTotal: new BigNumber(100),
//             stakeSelf: new BigNumber(100),
//             posWeight: new BigNumber(Math.random()),
//             stakeWeight: new BigNumber(Math.random()),
//             performance: new BigNumber(Math.random())
//         },
//         '0xa0df2de13945675e009445e8bc6f3ec2f0a54262a6dc78c76c1a58e333322b64': {
//             active: "0x01",
//             address: "0xa0df2de13945675e009445e8bc6f3ec2f0a54262a6dc78c76c1a58e333322b64",
//             fee: new BigNumber(100).shiftedBy(-6),
//             meta: { name: "5mpj", logo: "https://s3.amazonaws.com/keybase_processed_uploads/85a48000fca5fb9c255fc260274f5605_360_360.jpg", url: "" },
//             metaDataurl: "https://mindfulstaking.com",
//             posBlkTotal: new BigNumber(100),
//             stakeTotal: new BigNumber(100),
//             stakeSelf: new BigNumber(100),
//             posWeight: new BigNumber(Math.random()),
//             stakeWeight: new BigNumber(Math.random()),
//             performance: new BigNumber(Math.random())
//         },
//     },
//     history: {
//         "0xe34caf6d4ff9dccf3d7e1cb5324c52b3f74c44ed79055146737909363e104671":{
//             hash: "0xe34caf6d4ff9dccf3d7e1cb5324c52b3f74c44ed79055146737909363e104671",
//             amount: new BigNumber(100),
//             timestamp: '16dec7fe694',
//             type: 'ADSPoolRegistered',
//             pool: '0xa0c0792c2d2e97d6907b42440ffe64181080cdff145f70c6c2a3c5379a7d744a',
//         },
//         "0xaff0360c0fbc5aa965c8338ec849a329b3d8c030a1b9ffb834e6fbb16477493c":{
//             hash: "0xaff0360c0fbc5aa965c8338ec849a329b3d8c030a1b9ffb834e6fbb16477493c",
//             amount: new BigNumber(120),
//             timestamp: '16dec7fe994',
//             type: 'ADSPoolRegistered',
//             pool: '0xa0c0792c2d2e97d6907b42440ffe64181080cdff145f70c6c2a3c5379a7d744a',
//         },
//     },
//     operation: {
//         pool:'',
//         type: operationType.default
//     }
// }

const accountReducer = (
    state: IAccountState = defaultState2,
    action
): IAccountState => {
    if (action.type === "account/update") {
        return { ...state, ...action.payload };
    }
    if (action.type === "account/updatePoolLogo") {
        const { pool, logo } = action.payload;
        if (state.pools[pool]) {
            const { pools } = state;
            pools[pool].meta.logo = logo;
            state.pools = { ...pools };
            return { ...state };
        }
    }
    if (action.type === "account/deepUpdate") {
        const newState: IAccountState = deepMergeObject(state, action.payload);
        return { ...newState };
    }
    if (action.type === "account/setAccount") {
        return { ...state, address: action.payload };
    }
    return state;
};
export default accountReducer;
