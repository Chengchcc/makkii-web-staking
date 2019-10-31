/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import ReconnectingWebSocket from 'reconnecting-websocket';
import BigNumber from 'bignumber.js';
import store, { createAction } from '../reducers/store';
import { AIONDECIMAL } from './constants.json'
import { hexCharCodeToStr } from '.';

const url = 'wss://staking.chaion.net/api'
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
    let total_pos_blk = new BigNumber(0)
    let total_stake = new BigNumber(0)
    // eslint-disable-next-line no-restricted-syntax
    for (const el of Object.values(pools)) {
        const meta_data_url = hexCharCodeToStr(el.meta_data_url);
        total_pos_blk = total_pos_blk.plus(el.pos_blk_total)
        const stakeTotal = new BigNumber(el.stake_total).shiftedBy(AIONDECIMAL);
        const stakeSelf = new BigNumber(el.stake_self).shiftedBy(AIONDECIMAL);
        map[el.address] = {
            address: el.address,
            stakeTotal: new BigNumber(el.stake_total).shiftedBy(AIONDECIMAL),
            stakeSelf: new BigNumber(el.stake_self).shiftedBy(AIONDECIMAL),
            fee: new BigNumber(el.fee).shiftedBy(-6),
            active: el.active,
            metaDataurl: meta_data_url,
            posBlkTotal: new BigNumber(el.pos_blk_total),
            meta: {
                name: el.meta_name,
                logo: el.meta_logo,
                url: el.meta_url,
                tags: el.meta_tags,
                version: el.meta_version,
            }
        };
        total_stake = total_stake.plus(stakeTotal).plus(stakeSelf)
    }
    Object.values(map).forEach((el: any) => {
        el.stakeWeight = total_pos_blk.isEqualTo(0) ? new BigNumber(0) : el.posBlkTotal.dividedBy(total_pos_blk);
        const stake = el.stakeTotal.plus(el.stakeSelf);
        if (total_stake.isEqualTo(0) || stake.isEqualTo(0) || el.stakeWeight.isEqualTo(0)) {
            el.performance = new BigNumber(0)
        } else {
            el.performance = el.stakeWeight.dividedBy(el.stakeTotal.plus(el.stakeSelf).dividedBy(total_stake))

        }
    });
    callback({ pools: map });
}
ws.onmessage = e => {
    const { method, result } = JSON.parse(e.data);
    switch (method) {
        case 'pools':
            console.log('ws recv [pools] res=>', result);
            process_pools(result, (payload) => {
                store.dispatch(createAction('account/update')(payload))
            })
            break;
        case 'delegations': {
            console.log('ws recv [delgations] res=>', result);
            const { total_pages, current_page, data } = result;
            let stake = new BigNumber(0)
            let rewards = new BigNumber(0)
            const delegations = { ...data };
            Object.keys(delegations).forEach(v => {
                delegations[v].rewards = new BigNumber(delegations[v].rewards).shiftedBy(AIONDECIMAL)
                delegations[v].stake = new BigNumber(delegations[v].stake === '0x' ? 0 : delegations[v].stake).shiftedBy(AIONDECIMAL)
                stake = stake.plus(delegations[v].stake)
                rewards = rewards.plus(delegations[v].rewards)
                delegations[v].rewards = new BigNumber(delegations[v].rewards).shiftedBy(AIONDECIMAL)
            })
            const { delegations: oldDelegations } = store.getState().account
            store.dispatch(createAction('account/update')(
                { stakedAmount: stake, rewards, delegations: { ...oldDelegations, ...delegations }, delegationsPagination: { current: current_page, total: total_pages } }
                ))
        }
            break;
        case 'undelegations': {
            console.log('ws recv [undelegations] res=>', result);
            const { total_pages, current_page, data } = result;

            let unDelegated = new BigNumber(0);
            const undelegations = { ...data };
            Object.keys(undelegations).forEach(v => {
                undelegations[v].amount = new BigNumber(undelegations[v].amount).shiftedBy(AIONDECIMAL)
                undelegations[v].blockNumber = undelegations[v].block_number
                unDelegated = unDelegated.plus(undelegations[v].amount)
            })
            const { undelegations: oldUndelegations } = store.getState().account
            store.dispatch(createAction('account/update')(
                { undelegationAmount: unDelegated, undelegations: { ...oldUndelegations, ...undelegations }, undelegationsPagination: { current: current_page, total: total_pages } }
                ))
        }
            break;
        case 'transactions': {
            console.log('ws recv [transactions] res=>', result);
            const { total_pages, current_page, data } = result;
            const history_ = [...data];
            const history = history_.reduce((map,v)=> {
                v.amount = new BigNumber(v.amount).shiftedBy(AIONDECIMAL)
                if (v.amount.toString() === 'NaN') v.amount = new BigNumber(0)
                map[v.hash] = v;
                return map
            }, {});
            const { history: oldHistory } = store.getState().account
            store.dispatch(createAction('account/update')(
                { history: { ...oldHistory, ...history }, historyPagination: { current: current_page, total: total_pages } }
                ))
        }
            break;
        case 'eth_getBalance':
            console.log('ws recv [eth_getBalance] res=>', result);

            store.dispatch(createAction('account/update')({ liquidBalance: new BigNumber(result||0).shiftedBy(AIONDECIMAL) }))
            break;
        default:
            break

    }
}

export const wsSend = (payload, time = 1) => {
    console.log('ws send =>', payload)
    if (ws === null || time < 1) return
    if (ws.readyState !== 1) {
        setTimeout(() => {
            wsSend(payload, time === undefined ? 5 : time - 1)
        }, 2000)
    }
    ws.send(JSON.stringify(payload))
}



export default ws;