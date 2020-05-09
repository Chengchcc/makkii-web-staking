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
import "./style.less";
import i18n from "@utils/i18n";

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

enum SORTINGS {
    fee = "sort_fee",
    performance = "sort_perfomance",
    status = "sort_status"
}

const sortBy = (field: string, seq = false) => (
    pools: Array<Ipool>
): Array<Ipool> => {
    return pools.sort((a, b) =>
        seq ? b[field] - a[field] : a[field] - b[field]
    );
};

const sortings = [SORTINGS.status, SORTINGS.fee, SORTINGS.performance];
const poolList = () => {
    const poolsOrigin = usePools();
    const [currSorting, setSorting] = React.useState(SORTINGS.status);
    const [sortVisiable, setSortVisiable] = React.useState(false);
    const pools =
        currSorting === SORTINGS.fee
            ? sortBy("fee")(poolsOrigin)
            : currSorting === SORTINGS.performance
            ? sortBy("performance", true)(poolsOrigin)
            : poolsOrigin;

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

    // handlers;
    const openSorting = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setSortVisiable(!sortVisiable);
    };

    // renders
    return (
        <MoreList
            onReachEnd={onReachEnd}
            onRefresh={onRefresh}
            hasMore={false}
            data={pools}
            renderItem={pool => {
                return <PoolItem pool={pool} toPool={toPool} />;
            }}
            title={() => (
                <div className="sorting-container">
                    <div
                        className={
                            sortVisiable ? "sort-title open" : "sort-title"
                        }
                        onClick={openSorting}
                    >
                        {i18n.t(currSorting.toString())}
                    </div>
                    <div
                        className={
                            sortVisiable
                                ? "sort-data-set open"
                                : "sort-data-set"
                        }
                    >
                        <ul>
                            {sortings.map(el => (
                                <li
                                    className={
                                        el === currSorting ? "selected" : ""
                                    }
                                    onClick={e => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSorting(el);
                                    }}
                                >
                                    {i18n.t(el.toString())}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        />
    );
};
poolList.canGoBack = () => {
    const { address } = store.getState().account;
    return address !== "";
};
export default poolList;
