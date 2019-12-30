/* eslint-disable no-unused-vars */
import React from "react";
import { operationType, IAccountState } from "@reducers/accountReducer";
import Spin from "@components/spin";
import { useSelector } from "react-redux";
import { formatAddress, handleSwitchAccount, deepEqual } from "@utils/index";
import { wsSend, wsSendOnce } from "@utils/websocket";
import store, { createAction } from "@reducers/store";
import ReactPullLoad, { STATS } from "@components/pullLoad";
import { CommonButton } from "@components/button";
import i18n from "@utils/i18n";
import history from "@utils/history";
import "./style.less";
import {
    renderAccountInfo,
    renderDelegations,
    renderUnDelegations,
    renderPools,
    renderTransaction,
    renderTransfers
} from "./components";
import {
    process_delegations,
    process_undelegations,
    process_transactions,
    process_transfers
} from "./template";

export * from "./template";
declare const CURRENTVERSION: string;
const toDelegate = e => {
    e.preventDefault();
    const { operation } = store.getState().account;
    store.dispatch(
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
    const { operation } = store.getState().account;
    store.dispatch(
        createAction("account/update")({
            operation: {
                ...operation,
                type: operationType.withdraw
            }
        })
    );
    history.push("/poollist");
};

let scrollTop = 0;

const useHomeSelector = () => {
    const delegations = useSelector(
        (state: { account: IAccountState }) => ({
            ...state.account.delegations
        }),
        deepEqual
    );
    const undelegations = useSelector(
        (state: { account: IAccountState }) => ({
            ...state.account.undelegations
        }),
        deepEqual
    );
    const delegationTransfers = useSelector(
        (state: { account: IAccountState }) => ({
            ...state.account.delegationTransfers
        }),
        deepEqual
    );
    const transactions = useSelector(
        (state: { account: IAccountState }) => ({
            ...state.account.history
        }),
        deepEqual
    );
    const pools = useSelector((state: { account: IAccountState }) => ({
        ...state.account.pools
    }));
    const account = useSelector(
        (state: { account: IAccountState }) => ({
            address: state.account.address,
            liquidBalance: state.account.liquidBalance,
            stakedAmount: state.account.stakedAmount,
            undelegationAmount: state.account.undelegationAmount,
            rewards: state.account.rewards
        }),
        deepEqual
    );
    return {
        delegations,
        undelegations,
        delegationTransfers,
        pools,
        transactions,
        account
    };
};

const home = () => {
    // selector
    const {
        delegations,
        undelegations,
        delegationTransfers,
        pools,
        transactions,
        account
    } = useHomeSelector();
    const { address } = account;
    const [state, setState] = React.useState({
        action: STATS.init,
        isLoading: true
    });
    const addressRef = React.useRef(address);
    const actionRef = React.useRef(state.action);
    const timerRef = React.useRef(null);
    const updators = React.useRef([false, false, false, false]);
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
    const updateIdx = idx => {
        updators.current[idx] = true;
    };

    const fetchData = () => {
        updators.current = [false, false, false, false];
        wsSendOnce({ method: "eth_getBalance", params: [address] });
        wsSendOnce({ method: "delegations", params: [address, 0, 10] }, () =>
            updateIdx(0)
        );
        wsSendOnce({ method: "transactions", params: [address, 0, 10] }, () =>
            updateIdx(1)
        );
        wsSend({ method: "pools", params: [false] });
        wsSendOnce({ method: "undelegations", params: [address, 0, 10] }, () =>
            updateIdx(2)
        );
        wsSendOnce(
            {
                method: "delegation_transfers",
                params: [address, 0, 10]
            },
            () => updateIdx(3)
        );
        timerRef.current = setTimeout(actionTimeOut, 10 * 1000);
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
            fetchData();
        }
        // DO NOT modify below code
        setState({
            ...state,
            action
        });
    };

    React.useEffect(() => {
        if (!updators.current.slice(0, 4).some(r => !r)) {
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
        }
    }, [pools, delegations, undelegations, transactions, delegationTransfers]);

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
        if (Object.keys(pools).length > 0 && state.isLoading) {
            setState({
                ...state,
                isLoading: false
            });
        }
        if (Object.keys(pools).length === 0) {
            fetchData();
        }
    }, []);

    React.useEffect(() => {
        if (addressRef.current !== address && !state.isLoading) {
            setState({
                ...state,
                isLoading: true
            });
            fetchData();
        }
        addressRef.current = address;
    }, [address]);

    const hasPools = Object.keys(pools).length > 0;
    const hasDelegations = Object.keys(delegations).length > 0;
    const hasUndelegations = Object.keys(undelegations).length > 0;
    const hasHistory = Object.keys(transactions).length > 0;
    const hasTransfers = Object.keys(delegationTransfers).length > 0;
    return (
        <div className="flex-container">
            <ReactPullLoad
                downEnough={100}
                isBlockContainer
                handleAction={handleAction}
                action={state.action}
                hasMore={false}
                FooterNode={() => (
                    <div className="footer">
                        <p>Powered by Makkii</p>
                        <p>{`Version: ${CURRENTVERSION}`}</p>
                    </div>
                )}
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
                    {renderAccountInfo(account)}
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
                            renderDelegations(
                                i18n.t("delegations.card_title"),
                                process_delegations(delegations).slice(0, 3)
                            )}
                        {hasPools &&
                            hasUndelegations &&
                            renderUnDelegations(
                                i18n.t("undelegations.card_title"),
                                process_undelegations(undelegations).slice(0, 3)
                            )}

                        {hasPools &&
                            renderPools(i18n.t("pool_lists.card_title"), pools)}
                        {hasPools &&
                            hasHistory &&
                            renderTransaction(
                                i18n.t("history.card_title"),
                                process_transactions(transactions).slice(0, 3)
                            )}
                        {hasPools &&
                            hasTransfers &&
                            renderTransfers(
                                i18n.t("transfers.card_title"),
                                process_transfers(delegationTransfers).slice(
                                    0,
                                    3
                                )
                            )}
                    </>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flex: 1,
                            height: "90%",
                            alignItems: "flex-start",
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
