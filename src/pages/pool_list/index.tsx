/* eslint-disable no-nested-ternary */
import React from "react";
import MoreList from "@components/more_list";
import { PoolItem } from "@components/pool_item";
import { useSelector, shallowEqual } from "react-redux";
import { wsSend } from "@utils/websocket";
import store, { createAction } from "@reducers/store";
import { operationType } from "@reducers/accountReducer";
import { Ipool, Idelegation } from "@interfaces/types";
import history from "@utils/history";
import { performance_low, performance_high } from "@utils/constants.json";

const mapToState = ({ account }) => {
    return {
        pools: { ...account.pools },
        operation: { ...account.operation },
        delegations: { ...account.delegations }
    };
};

const usePools = () => {
    const {
        pools,
        operation,
        delegations
    }: {
        pools: { [address: string]: Ipool };
        delegations: { [poolAddres: string]: Idelegation };
        operation: {
            pool: string;
            type: operationType | string;
        };
    } = useSelector(mapToState, shallowEqual);
    const [can_undelegate, can_withdraw] = Object.keys(delegations).reduce(
        ([arr1, arr2], el) => {
            const { stake, rewards } = delegations[el];
            if (stake.gt(0)) {
                arr1.push(el);
            }
            if (rewards.gt(0)) {
                arr2.push(el);
            }
            return [arr1, arr2];
        },
        [[], []]
    );

    let filters = [];
    switch (operation.type) {
        case operationType.undelegate:
            filters = can_undelegate;
            break;
        case operationType.withdraw:
            filters = can_withdraw;
            break;
        default:
            filters = Object.keys(pools);
    }
    if (typeof operation.type === "string") {
        // when transfer, should filter 'from' pool
        filters.forEach((addr, idx) => {
            if (operation.pool === addr) {
                filters.splice(idx, 1);
            }
        });
    }
    const sorter = (a: Ipool, b: Ipool) => {
        const getLevel = (pool: Ipool) => {
            const performanceNumber = pool.performance.times(100).toNumber();
            return !pool.active
                ? 0
                : performanceNumber > performance_high
                ? 3
                : performanceNumber < performance_low
                ? 1
                : 2;
        };
        return getLevel(b) - getLevel(a);
    };
    return Object.values(pools)
        .filter(el => filters.includes(el.address))
        .sort(sorter);
};

const onRefresh = () => {
    wsSend({ method: "pools", params: [false] });
};

const onReachEnd = () => {
    wsSend({ method: "pools", params: [false] });
};

const toPool = pool => {
    const { operation } = store.getState().account;
    if (typeof operation.type === "string") {
        store.dispatch(
            createAction("account/update")({
                operation: {
                    ...operation,
                    type: pool
                }
            })
        );
        history.replace("/transfer");
    } else {
        store.dispatch(
            createAction("account/update")({
                operation: {
                    ...operation,
                    pool
                }
            })
        );
        if (operationType.default === operation.type) {
            history.push("/operation");
        } else if (operationType.delegate === operation.type) {
            history.push("/delegate");
        } else if (operationType.undelegate === operation.type) {
            history.push("/undelegate");
        } else if (operationType.withdraw === operation.type) {
            history.push("/withdraw");
        }
    }
};

let scrollTop = 0;
const poolList = () => {
    const pools = usePools();

    React.useEffect(() => {
        if (Object.keys(pools).length === 0) {
            wsSend({ method: "pools", params: [false] });
        }
    }, []);

    React.useEffect(() => {
        const element =
            document.getElementById("pullLoadContainer") || document.body;
        const handleScollTop = e => {
            scrollTop = e.target.scrollTop;
        };
        element.addEventListener("scroll", handleScollTop);
        if (scrollTop && navigator.userAgent.match("Android")) {
            element.scrollTop = scrollTop;
        }
        return () => {
            element.removeEventListener("scroll", handleScollTop);
        };
    });
    return (
        <MoreList
            onReachEnd={onReachEnd}
            onRefresh={onRefresh}
            hasMore={false}
            data={pools}
            renderItem={pool => {
                return <PoolItem pool={pool} toPool={toPool} />;
            }}
        />
    );
};
poolList.canGoBack = () => {
    const { address } = store.getState().account;
    return address !== "";
};
export default poolList;
