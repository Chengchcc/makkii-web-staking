/* eslint-disable no-unused-vars */
import React from "react";
import { History } from "history";
import { operationType } from "@reducers/accountReducer";
import Spin from "@components/spin";
import { useSelector, useDispatch } from "react-redux";
import {
    formatAddress,
    handleSwitchAccount,
    block_remain_to_time
} from "@utils/index";
import { wsSend, wsSendOnce } from "@utils/websocket";
import { PoolItem, PoolItemMore, Iinfo } from "@components/pool_item";
import TransactionItem from "@components/transaction_item";
import { createAction } from "@reducers/store";
import operation from "@pages/operation";
import ReactPullLoad, { STATS } from "@components/pullLoad";
import { CommonButton } from "@components/button";
import i18n from "@utils/i18n";
import Card from "./card";
import "./style.less";

const logo = require("@/img/metaLogo2.png");

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

export const process_transctions = transctions => {
    return Object.values(transctions).sort(
        (a: any, b: any) => a.timestamp - b.timestamp
    );
};
interface Ihome {
    history: History;
}
const mapToState = ({ account }) => {
    return {
        address: account.address,
        liquidBalance: account.liquidBalance,
        stakedAmount: account.stakedAmount,
        undelegationAmount: account.undelegationAmount,
        rewards: account.rewards,
        pools: account.pools,
        delegations: account.delegations,
        undelegations: account.undelegations,
        history: account.history,
        operation: account.operation
    };
};
const accountInfo = [
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

const renderAccountInfo = (info, src) => {
    return (
        <div className="header-info">
            {info.map(el => {
                const { dataIndex, title, render } = el;
                const val = src[dataIndex];
                return (
                    <div key={title} className="header-info-item ">
                        <div className="header-info-item-value">
                            {render(val)}
                        </div>
                        <div className="header-info-item-title">
                            {i18n.t(title)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

let scrollTop = 0;

const home = (props: Ihome) => {
    const { history } = props;
    const account = useSelector(mapToState);
    const accountRef = React.useRef(account);
    const [state, setState] = React.useState({
        action: STATS.init,
        isLoading: false
    });
    const actionRef = React.useRef(state.action);
    const timerRef = React.useRef(null);
    const dispath = useDispatch();
    const {
        address,
        pools,
        delegations,
        undelegations,
        history: transactions
    } = account;

    const toDelegate = e => {
        e.preventDefault();

        dispath(
            createAction("account/update")({
                operation: {
                    ...operation,
                    type: operationType.delegate
                }
            })
        );
        history.push("/poollist");
    };
    const toWithDraw = e => {
        e.preventDefault();
        dispath(
            createAction("account/update")({
                operation: {
                    ...operation,
                    type: operationType.withdraw
                }
            })
        );
        history.push("/poollist");
    };
    const toPoolList = () => {
        dispath(
            createAction("account/update")({
                operation: {
                    ...operation,
                    type: operationType.default // reset operation
                }
            })
        );
        history.push("/poollist");
    };
    const toDelegations = () => {
        history.push("/delegations");
    };
    const toPendingUndlegation = () => {
        history.push("/pendingundelegation");
    };
    const toHistoryList = () => {
        history.push("/history");
    };
    const toPool = pool => {
        dispath(
            createAction("account/update")({
                operation: {
                    pool
                }
            })
        );
        history.push("/operation");
    };

    const actionTimeOut = () => {
        if (actionRef.current === STATS.refreshing) {
            setState({
                action: STATS.refreshed,
                isLoading: false
            });
            actionRef.current = STATS.refreshed;
        }
        if (actionRef.current === STATS.loading) {
            setState({
                action: STATS.reset,
                isLoading: false
            });
            actionRef.current = STATS.reset;
        }
    };

    const handleAction = action => {
        actionRef.current = action;
        if (
            action === state.action ||
            (action === STATS.refreshing && state.action === STATS.loading) ||
            (action === STATS.loading && state.action === STATS.refreshing)
        ) {
            // console.info("It's same action or on loading or on refreshing ",action, state.action,action === state.action);
            return;
        }
        if (action === STATS.refreshing) {
            // refreshing
            // onRefresh();
            wsSendOnce({ method: "eth_getBalance", params: [address] });
            wsSendOnce({ method: "delegations", params: [address, 0, 10] });
            wsSendOnce({ method: "transactions", params: [address, 0, 10] });
            wsSend({ method: "pools", params: [] });
            wsSendOnce({ method: "undelegations", params: [address, 0, 10] });
            timerRef.current = setTimeout(actionTimeOut, 10 * 1000);
        } else if (action === STATS.loading) {
            // loading more
            // nothiing
        }
        // DO NOT modify below code
        setState({
            ...state,
            action
        });
    };
    React.useEffect(() => {
        if (!Object.keys(pools).length) {
            setState({
                ...state,
                isLoading: true
            });
        }
    }, []);

    React.useEffect(() => {
        const {
            pools: pools_,
            delegations: delegations_,
            undelegations: undelegations_,
            history: transactions_
        } = accountRef.current;
        if (
            pools_ !== pools &&
            delegations_ !== delegations &&
            undelegations_ !== undelegations &&
            transactions_ !== transactions
        ) {
            const newState = { ...state };
            let update = false;
            if (state.isLoading) {
                newState.isLoading = false;
                update = true;
            }
            if (state.action === STATS.refreshing) {
                newState.action = STATS.refreshed;
                update = true;
            } else if (state.action === STATS.loading) {
                newState.action = STATS.reset;
                update = true;
            }
            if (update) {
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                    timerRef.current = null;
                }
                actionRef.current = newState.action;
                setState(newState);
            }
            accountRef.current = account;
        }
    }, [pools, delegations, undelegations, transactions]);

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

    React.useEffect(() => {
        if (accountRef.current.address !== address && !state.isLoading) {
            setState({
                ...state,
                isLoading: true
            });
        }
    }, [address]);
    const renderPools = (title, lists_) => {
        const sorter = (a: any, b: any) => {
            return b.performance.toNumber() - a.performance.toNumber();
        };

        const lists = Object.values(lists_)
            .sort(sorter)
            .slice(0, 3);
        return (
            <Card
                title={title}
                lists={lists}
                renderItem={(el, key) => {
                    return <PoolItem key={key} pool={el} toPool={toPool} />;
                }}
                handleMore={toPoolList}
            />
        );
    };

    const renderPoolsMore = (title, lists, info, handleMore) => {
        return (
            <Card
                title={title}
                lists={lists}
                renderItem={(el, key) => {
                    return (
                        <PoolItemMore
                            key={key}
                            pool={pools[el.poolAddress]}
                            value={el}
                            info={info}
                            toPool={toPool}
                        />
                    );
                }}
                handleMore={handleMore}
            />
        );
    };
    const renderTransaction = (title, lists, handleMore) => {
        return (
            <Card
                title={title}
                lists={lists}
                renderItem={(el, key) => {
                    return (
                        <TransactionItem
                            key={key}
                            pool={pools[el.pool]}
                            transaction={el}
                        />
                    );
                }}
                handleMore={handleMore}
            />
        );
    };

    const hasPools = Object.keys(pools).length > 0;
    const hasDelegations = Object.keys(delegations).length > 0;
    const hasUndelegations = Object.keys(undelegations).length > 0;
    const hasHistory = Object.keys(transactions).length > 0;
    return (
        <div className="flex-container">
            <ReactPullLoad
                downEnough={100}
                isBlockContainer
                handleAction={handleAction}
                action={state.action}
                hasMore={false}
                FooterNode={() => <div />}
            >
                <div className="home-header">
                    <div className="header-account">
                        <span style={{ fontSize: "14px" }}>
                            <strong>
                                {i18n.t("account.label_my_account")}:
                            </strong>
                            {` ${formatAddress(address)}`}
                        </span>
                        <CommonButton
                            className="switch-account-button button-orange"
                            title={i18n.t("account.button_switch_account")}
                            onClick={handleSwitchAccount}
                        />
                    </div>
                    {renderAccountInfo(accountInfo, account)}
                </div>
                <div className="home-button-container">
                    <CommonButton
                        className="home-button button-orange"
                        title={i18n.t("operation.button_delegate")}
                        onClick={toDelegate}
                    />
                    <CommonButton
                        className="home-button button-orange"
                        title={i18n.t("operation.button_withdraw")}
                        onClick={toWithDraw}
                        disabled={account.rewards.isEqualTo(0)}
                    />
                </div>
                {!state.isLoading ? (
                    <>
                        {hasPools &&
                            hasDelegations &&
                            renderPoolsMore(
                                i18n.t("delegations.card_title"),
                                process_delegations(delegations).slice(0, 3),
                                delegationInfo,
                                toDelegations
                            )}
                        {hasPools &&
                            hasUndelegations &&
                            renderPoolsMore(
                                i18n.t("undelegations.card_title"),
                                process_undelegations(undelegations).slice(
                                    0,
                                    3
                                ),
                                unDelegationInfo,
                                toPendingUndlegation
                            )}
                        {hasPools &&
                            renderPools(i18n.t("pool_lists.card_title"), pools)}
                        {hasPools &&
                            hasHistory &&
                            renderTransaction(
                                i18n.t("history.card_title"),
                                process_transctions(transactions).slice(0, 3),
                                toHistoryList
                            )}
                    </>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: "30"
                        }}
                    >
                        <Spin />
                    </div>
                )}
            </ReactPullLoad>
        </div>
    );
};

export default home;
