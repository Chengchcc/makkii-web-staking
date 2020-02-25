/* eslint-disable radix */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import ReconnectingWebSocket from "reconnecting-websocket";
import BigNumber from "bignumber.js";
import { IAccountState } from "@reducers/accountReducer";
import store, { createAction } from "../reducers/store";
import {
    AIONDECIMAL,
    WS_URL_AMITY,
    WS_URL_MAINNET,
    undelegation_lock_blocks,
    BLOCK_NUMBER_BASE
} from "./constants.json";
import { hexCharCodeToStr } from ".";

declare const NETWORK: string;

let ws_id = 0;

type KICK_METHOD = () => any;

const WS_TICKET_MAP: { [id: string]: KICK_METHOD } = {};

const url = NETWORK === "amity" ? WS_URL_AMITY : WS_URL_MAINNET;
// const url =  WS_URL_MAINNET
const ws = new ReconnectingWebSocket(url);
/**
name:
logo:
url:
 */

/**
 *
 * @param pools
 * @param callback
 */
const process_pools = async (pools: { [address: string]: any }, callback) => {
    const map = {};
    let total_pos_blk = new BigNumber(0);
    let total_stake = new BigNumber(0);
    // eslint-disable-next-line no-restricted-syntax
    for (const el of Object.values(pools)) {
        const meta_data_url = hexCharCodeToStr(el.meta_data_url);
        total_pos_blk = total_pos_blk.plus(el.pos_blk_total);
        const stakeTotal = new BigNumber(el.stake_total).shiftedBy(AIONDECIMAL);
        const stakeSelf = new BigNumber(el.stake_self).shiftedBy(AIONDECIMAL);
        map[el.address] = {
            address: el.address,
            stakeTotal,
            stakeSelf,
            fee: new BigNumber(el.fee).shiftedBy(-6),
            active:
                el.active === "0x01" &&
                stakeSelf.toNumber() >= 1000 &&
                stakeTotal.toNumber() <= stakeSelf.toNumber() * 99,
            metaDataurl: meta_data_url,
            posBlkTotal: new BigNumber(el.pos_blk_total),
            meta: {
                name: el.meta_name,
                logo: null,
                url: el.meta_url,
                tags: el.meta_tags,
                version: el.meta_version
            },
            performance: new BigNumber(el.performance)
        };
        total_stake = total_stake.plus(stakeTotal);
    }
    Object.values(map).forEach((el: any) => {
        el.posWeight = total_pos_blk.isEqualTo(0)
            ? new BigNumber(0)
            : el.posBlkTotal.dividedBy(total_pos_blk);
        el.stakeWeight = total_stake.isEqualTo(0)
            ? new BigNumber(0)
            : el.stakeTotal.dividedBy(total_stake);
    });
    callback({ pools: map });
};

const handle_result = (method, result, payload_: { params: any[] }) => {
    switch (method) {
        case "pool_logo":
            {
                const address = payload_.params[0];
                const logo = result || "undefined";
                if (
                    store.getState().account.pools[address].meta.logo === null
                ) {
                    store.dispatch(
                        createAction("account/updatePoolLogo")({
                            pool: address,
                            logo
                        })
                    );
                }
            }
            break;
        case "pools":
            console.log("ws recv [pools] res=>", result);
            if (!result) break;
            process_pools(result, payload => {
                store.dispatch(createAction("account/deepUpdate")(payload));
            });
            break;
        case "delegations":
            {
                console.log("ws recv [delgations] res=>", result);
                if (!result) break;
                const { total_pages, current_page, data } = result;
                let stake = new BigNumber(0);
                let rewards = new BigNumber(0);
                const delegations = { ...data };
                Object.keys(delegations).forEach(v => {
                    delegations[v].rewards = new BigNumber(
                        delegations[v].rewards
                    ).shiftedBy(AIONDECIMAL);
                    delegations[v].stake = new BigNumber(
                        delegations[v].stake === "0x" ? 0 : delegations[v].stake
                    ).shiftedBy(AIONDECIMAL);
                    stake = stake.plus(delegations[v].stake);
                    rewards = rewards.plus(delegations[v].rewards);
                    delegations[v].rewards = new BigNumber(
                        delegations[v].rewards
                    );
                });
                const {
                    delegations: oldDelegations
                } = store.getState().account;
                store.dispatch(
                    createAction("account/update")({
                        stakedAmount: stake,
                        rewards,
                        delegations: { ...oldDelegations, ...delegations },
                        delegationsPagination: {
                            current: current_page,
                            total: total_pages
                        }
                    })
                );
            }
            break;
        case "undelegations":
            {
                console.log("ws recv [undelegations] res=>", result);
                if (!result) break;
                const { total_pages, current_page, data } = result;

                let unDelegated = new BigNumber(0);
                const undelegations = { ...data };
                Object.keys(undelegations).forEach(v => {
                    undelegations[v].amount = new BigNumber(
                        undelegations[v].amount
                    ).shiftedBy(AIONDECIMAL);
                    undelegations[v].blockNumber =
                        undelegations[v].block_number;
                    unDelegated = unDelegated.plus(undelegations[v].amount);
                });
                const {
                    undelegations: oldUndelegations
                } = store.getState().account;
                store.dispatch(
                    createAction("account/update")({
                        undelegationAmount: unDelegated,
                        undelegations: {
                            ...oldUndelegations,
                            ...undelegations
                        },
                        undelegationsPagination: {
                            current: current_page,
                            total: total_pages
                        }
                    })
                );
            }
            break;
        case "delegation_transfers":
            {
                console.log("ws recv [delegation_transfers] res=>", result);
                if (!result) break;
                const { total_pages, current_page, data } = result;
                const transfers = { ...data };
                Object.keys(transfers).forEach(v => {
                    transfers[v].amount = new BigNumber(
                        transfers[v].amount
                    ).shiftedBy(AIONDECIMAL);
                });
                const {
                    delegationTransfers: oldDelegationTransfers
                } = store.getState().account;
                store.dispatch(
                    createAction("account/update")({
                        delegationTransfers: {
                            ...oldDelegationTransfers,
                            ...transfers
                        },
                        delegationTransfersPagination: {
                            current: current_page,
                            total: total_pages
                        }
                    })
                );
            }
            break;
        case "transactions":
            {
                console.log("ws recv [transactions] res=>", result);
                if (!result) break;
                const { total_pages, current_page, data } = result;
                const history_ = [...data];
                const history = history_.reduce((map, v) => {
                    v.amount = new BigNumber(v.amount).shiftedBy(AIONDECIMAL);
                    if (v.amount.toString() === "NaN")
                        v.amount = new BigNumber(0);
                    map[v.hash + v.type] = v;
                    v.timestamp = v.block_timestamp;
                    return map;
                }, {});
                const { history: oldHistory } = store.getState().account;
                store.dispatch(
                    createAction("account/update")({
                        history: { ...oldHistory, ...history },
                        historyPagination: {
                            current: current_page,
                            total: total_pages
                        }
                    })
                );
            }
            break;
        case "eth_getBalance":
            console.log("ws recv [eth_getBalance] res=>", result);
            if (!result) break;
            store.dispatch(
                createAction("account/update")({
                    liquidBalance: new BigNumber(result || 0).shiftedBy(
                        AIONDECIMAL
                    )
                })
            );
            break;
        case "eth_blockNumber":
            {
                console.log("ws recv [eth_blockNumber] res=>", result);
                if (!result) {
                    break;
                }
                const blockNumber = parseInt(result, 10);
                const block_number_last = isNaN(blockNumber) ? 0 : blockNumber;
                const {
                    undelegations,
                    commissionRateChanges
                } = store.getState().account as IAccountState;
                const undelegations_ = { ...undelegations };
                const commissionRateChanges_ = [...commissionRateChanges];

                Object.values(undelegations_).forEach((v: any) => {
                    v.block_number_remaining =
                        undelegation_lock_blocks - blockNumber + v.blockNumber;
                    v.block_number_remaining =
                        v.block_number_remaining < 0
                            ? 0
                            : v.block_number_remaining;
                });
                commissionRateChanges_.forEach(v => {
                    v.block_number_remain =
                        BLOCK_NUMBER_BASE - block_number_last + v.block_number;
                    v.block_number_remain =
                        v.block_number_remain < 0 ? 0 : v.block_number_remain;
                });
                store.dispatch(
                    createAction("account/update")({
                        block_number_last,
                        undelegations: undelegations_,
                        commissionRateChanges: commissionRateChanges_
                    })
                );
            }
            break;
        case "commission_rate_changes":
            {
                console.log("ws recv [commission_rate_changes] res=>", result);
                if (!result) {
                    break;
                }
                const { block_number_last } = store.getState().account;
                result.data.forEach(v => {
                    console.log("v.block_timestamp", v.block_timestamp);
                    v.commission_rate = new BigNumber(
                        v.commission_rate
                    ).dividedBy(10000, 10);
                    v.block_timestamp = parseInt(v.block_timestamp) * 1000;
                    if (block_number_last) {
                        v.block_number_remain =
                            BLOCK_NUMBER_BASE -
                            block_number_last +
                            v.block_number;
                        v.block_number_remain =
                            v.block_number_remain < 0
                                ? 0
                                : v.block_number_remain;
                    }
                });
                store.dispatch(
                    createAction("account/update")({
                        commissionRateChanges: result.data
                    })
                );
            }
            break;
        default:
            break;
    }
};

const wsSend_ = (payload, time = 1): boolean => {
    if (ws === null || time < 1) {
        return false;
    }
    if (ws.readyState !== 1) {
        setTimeout(() => {
            wsSend_(payload, time === undefined ? 5 : time - 1);
        }, 2000);
    }
    ws.send(JSON.stringify(payload));
    return true;
};

const getWsId = () => {
    ws_id += 1;
    return `${ws_id}`;
};

export const wsSend = (payload_: any, callback?: (data: any) => any) => {
    const payload = payload_.id ? payload_ : { ...payload_, id: getWsId() };
    let handler = e => {
        const { method, result, id } = JSON.parse(e.data);
        if (method === payload.method && id === payload.id) {
            ws.removeEventListener("message", handler);
            handler = null;
            // default handle result
            handle_result(method, result, payload);
            // if callback; handle message data
            if (callback) {
                callback(JSON.parse(e.data));
            }
        }
    };
    ws.addEventListener("message", handler);
    wsSend_(payload);
    return () => {
        if (handler !== null) {
            ws.removeEventListener("message", handler);
            handler = null;
        }
    };
};

const get_kick_id = (method: string, id: string) => `KICK_${method}${id}`;

const add_ticket = (id: string, kickFunc: KICK_METHOD) => {
    const kick = WS_TICKET_MAP[id];
    if (typeof kick === "function") {
        kick();
    }
    WS_TICKET_MAP[id] = kickFunc;
};

const burn_ticket = id => {
    const kick = WS_TICKET_MAP[id];
    if (typeof kick === "function") {
        kick();
    }
    delete WS_TICKET_MAP[id];
};

export const wsSendOnce = (
    payload_: { method: string; params: any[] },
    cb?: () => void
) => {
    const payload = {
        ...payload_,
        id: getWsId()
    };
    const kick = wsSend(payload, data => {
        // callback burn kick
        const { method, id } = data;
        const kick_id = get_kick_id(method, id);
        burn_ticket(kick_id);
        if (cb) {
            cb();
        }
    });
    // add kick
    const kick_id = get_kick_id(payload.method, payload.id);
    add_ticket(kick_id, kick);
};

export const clearWsTikcet = (method: string) => {
    Object.keys(WS_TICKET_MAP).forEach(k => {
        if (k.indexOf(method) >= 0) {
            burn_ticket(k);
        }
    });
};

function ws_interval(obj) {
    if (!wsSend(obj)) {
        return;
    }
    setTimeout(() => ws_interval(obj), 10000);
}

ws_interval({ method: "eth_blockNumber", params: [] });

export default ws;
