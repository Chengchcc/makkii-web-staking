/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
import store, { createAction } from "@reducers/store";
import { alert } from "@components/modal";
import BigNumber from "bignumber.js";
import makkii from "makkii-webview-bridge";
import { wsSend, clearWsTikcet } from "./websocket";
import i18n from "./i18n";

export const formatPoolName = poolName => {
    let newPoolName = poolName[0].toUpperCase() + poolName.substr(1);
    if (newPoolName.length > 20) {
        newPoolName = `${newPoolName.substr(0, 17)}...`;
    }
    return newPoolName;
};
export const formatAddress = address => {
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
};

export const formatTxHash = txhash => {
    return `${txhash.slice(0, 15)}...${txhash.slice(-15)}`;
};

export function hexCharCodeToStr(hexCharCodeStr) {
    const trimed_Str = hexCharCodeStr.trim();
    const raw_str =
        trimed_Str.substr(0, 2).toLowerCase() === "0x"
            ? trimed_Str.substr(2)
            : trimed_Str;
    const len = raw_str.length;
    if (len % 2 !== 0) {
        console.log("Illegal Format ASCII Code!");
        return "";
    }
    let cur_char_Code;
    const result_str = [];
    for (let i = 0; i < len; i += 2) {
        cur_char_Code = parseInt(raw_str.substr(i, 2), 16); // ASCII Code Value
        result_str.push(String.fromCharCode(cur_char_Code));
    }
    return result_str.join("");
}

export const validateAmount = amount => {
    const reg = /^[0-9]?((\.[0-9]+)|([0-9]+(\.[0-9]*)?))$/;
    return reg.test(amount);
};

// mock
export const genPoolName = () => {
    const Template = "0123456789abcdefghjklmnopqrstuvwxyz";
    let str = "";
    for (let i = 0; i < 4; i += 1) {
        str += Template.charAt(parseInt(`${Math.random() * 26}`, 10));
    }
    return str;
};

export const handleSwitchAccount = () => {
    if (makkii.isconnect()) {
        makkii
            .switchAccount()
            .then(r => {
                console.log("handleSwitchAccount", r);
                clearWsTikcet("eth_getBalance");
                clearWsTikcet("delegations");
                clearWsTikcet("transactions");
                clearWsTikcet("undelegations");
                store.dispatch(
                    createAction("account/update")({
                        address: r,
                        liquidBalance: new BigNumber(-1),
                        stakedAmount: new BigNumber(-1),
                        undelegationAmount: new BigNumber(-1),
                        rewards: new BigNumber(-1),
                        delegations: {},
                        history: {},
                        undelegations: {},
                        delegationsPagination: { current: 0, total: 0 },
                        undelegationsPagination: { current: 0, total: 0 },
                        historyPagination: { current: 0, total: 0 }
                    })
                );
            })
            .catch(err => {
                console.log("switch account error=>", err);
            });
    } else {
        console.log("not in makkii env");
        alert({
            title: i18n.t("error_title"),
            message: i18n.t("error_no_makkii"),
            actions: [
                {
                    title: i18n.t("button_ok"),
                    onPress: () => {}
                },
                {
                    title: i18n.t("button_cancel")
                }
            ]
        });
    }
};
export function block_remain_to_time(time_remain) {
    let suffix = null;
    if (time_remain > 8640) {
        suffix = `${Math.ceil(time_remain / 8640)} ${i18n.t("unit_day2")}`;
    } else if (time_remain > 360) {
        suffix = `${Math.ceil(time_remain / 360)} ${i18n.t("unit_hour")}`;
    } else if (time_remain > 6) {
        suffix = `${Math.ceil(time_remain / 6)} ${i18n.t("unit_minute")}`;
    } else {
        suffix =
            time_remain > 0
                ? `≈ ${time_remain * 10} ${i18n.t("unit_second")}`
                : i18n.t("wait_for_finalization");
    }
    return time_remain > 6 ? `≈ ${suffix}` : suffix;
}
export function deepMergeObject(obj1, obj2) {
    Object.keys(obj2).forEach(key => {
        if (key !== null) {
            obj1[key] =
                obj1[key] && obj1[key].toString() === "[object Object]"
                    ? deepMergeObject(obj1[key], obj2[key])
                    : (obj1[key] = obj2[key]);
        }
    });
    return obj1;
}
const pool_request = [];

export function getPoolLogo(pool): string {
    if (pool.meta && pool.meta.logo !== null) {
        if (pool.meta.logo === "undefined") {
            return "";
        }
        return pool.meta.logo;
    }
    if (!pool_request.includes(pool.address)) {
        pool_request.push(pool.address);
        wsSend({ method: "pool_logo", params: [pool.address] }, () => {
            pool_request.forEach((addr, idx) => {
                if (addr === pool.address) {
                    pool_request.splice(idx, 1);
                }
            });
        });
    }

    return "";
}
