/* eslint-disable no-param-reassign */
import ReconnectingWebSocket from 'reconnecting-websocket';
import BigNumber from 'bignumber.js';
import Axios from 'axios';
import store, { createAction } from '../reducers/store';
import { AIONDECIMAL } from './constants.json'
import { hexCharCodeToStr, genPoolName} from '.';

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
            stakeSelf:  new BigNumber(el.stake_self).shiftedBy(AIONDECIMAL),
            fee: new BigNumber(el.fee).shiftedBy(-6),
            active: el.active,
            metaDataurl: meta_data_url,
            posBlkTotal: new BigNumber(el.pos_blk_total)
        };
        total_stake = total_stake.plus(stakeTotal).plus(stakeSelf)
        try {
            // eslint-disable-next-line no-await-in-loop
            // const { data } = await Axios.get(meta_data_url);
            map[el.address].meta = {
                name:genPoolName(), 
                logo:'https://s3.amazonaws.com/keybase_processed_uploads/85a48000fca5fb9c255fc260274f5605_360_360.jpg', 
                url: '' };
        } catch (e) {
            // TODO mock meta
            map[el.address].meta = {
                name:genPoolName(), 
                logo:'https://s3.amazonaws.com/keybase_processed_uploads/85a48000fca5fb9c255fc260274f5605_360_360.jpg', 
                url: '' }
            console.log('get meta data error', meta_data_url, e)
        }
    }
    Object.values(map).forEach((el:any)=>{
        el.stakeWeight = total_pos_blk.isEqualTo(0)? new BigNumber(0): el.posBlkTotal.dividedBy(total_pos_blk);
        const stake = el.stakeTotal.plus(el.stakeSelf);
        if(total_stake.isEqualTo(0)||stake.isEqualTo(0) || el.stakeWeight.isEqualTo(0)){
            el.performance = new BigNumber(0)
        }else{
            el.performance = el.stakeWeight.dividedBy(el.stakeTotal.plus(el.stakeSelf).dividedBy(total_stake))

        }
    });
    callback({pools:map});
}
ws.onmessage = e => {
    const { method, result } = JSON.parse(e.data);
    switch (method) {
        case 'pools': 
            console.log('get pools=>', result);
            process_pools(result, (payload) => {
                store.dispatch(createAction('account/update')(payload))
            })
            break;
        case 'delegations': {
            console.log('ws recv [delgations] res=>', result);
            let stake = new BigNumber(0)
            let rewards = new BigNumber(0)
            const delegations = {...result};
            Object.keys(delegations).forEach(v => {
                delegations[v].rewards = new BigNumber(delegations[v].rewards).shiftedBy(AIONDECIMAL)
                delegations[v].stake = new BigNumber(delegations[v].stake === '0x' ? 0 : delegations[v].stake).shiftedBy(AIONDECIMAL)
                stake = stake.plus(delegations[v].stake)
                rewards = rewards.plus(delegations[v].rewards)
                delegations[v].rewards = new BigNumber(delegations[v].rewards).shiftedBy(AIONDECIMAL)
            })
            store.dispatch(createAction('account/update')({ stakedAmount: stake, rewards, delegations }))
        }
            break;
        case 'undelegations': {
            console.log('ws recv [undelegations] res=>', result);          
            let unDelegated = new BigNumber(0);
            const undelegations = {...result};
            Object.keys(undelegations).forEach(v => {
                undelegations[v].amount = new BigNumber(undelegations[v].amount).shiftedBy(AIONDECIMAL)
                unDelegated = unDelegated.plus(undelegations[v].amount)
            })
            store.dispatch(createAction('account/update')({ undelegationAmount: unDelegated, undelegations }))
        }
            break;
        case 'transactions': {
            console.log('ws recv [transactions] res=>', result);          
            const history = {...result};
            Object.keys(history).forEach(v => {
                history[v].amount = new BigNumber(history[v].amount).shiftedBy(AIONDECIMAL)
                if (history[v].amount.toString() === 'NaN') history[v].amount = new BigNumber(0)
            })
            store.dispatch(createAction('account/update')({ history }))
        }
            break;
        case 'eth_getBalance':
            store.dispatch(createAction('account/update')({ liquidBalance: new BigNumber(result).shiftedBy(AIONDECIMAL) }))
            break;
        default:
            break

    }
}

export const wsSend = (payload, time = 1) => {
    if (ws === null || time < 1) return
    if (ws.readyState !== 1) {
        setTimeout(() => {
            wsSend(payload, time === undefined ? 5 : time - 1)
        }, 2000)
    }
    ws.send(JSON.stringify(payload))
}



export default ws;