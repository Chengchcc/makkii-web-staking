/* eslint-disable no-nested-ternary */
import React from "react";
import { useSelector, shallowEqual } from "react-redux";
import { operationType, IAccountState } from "@reducers/accountReducer";
import BigNumber from "bignumber.js";
import { formatAddress, handleSwitchAccount } from "@utils/index";
import { CommonButton } from "@components/button";
import store, { createAction } from "@reducers/store";
import Modal, { alert } from "@components/modal";
import Image from "@components/default-img";
import Switch from "@components/switch";
import i18n from "@utils/i18n";
import CommissionRateChangeList from "@pages/operation/commission_rate_change_list";
import { wsSend } from "@utils/websocket";
import makkii from "makkii-webview-bridge";
import {
    performance_low,
    performance_high,
    gas_disable_auto_delegate,
    gas_enable_auto_delegate,
    gasPrice,
    AIONDECIMAL
} from "@utils/constants.json";
import history from "@utils/history";
import { Ipool } from "@interfaces/index";
import {
    call_enable_auto_delegate,
    call_disable_auto_delegate
} from "@utils/transaction";
import { copyInputValue } from "@utils/util";
import CheckMark from "@/img/checkMark.svg";
import "./style.less";

const aionLogo = require("@/img/metaLogo2.png");

const poolDetailInfo = [
    {
        title: "operation.label_fees",
        dataIndex: "fee",
        render: val => {
            return <span>{val.times(100).toFixed(4)}%</span>;
        }
    },
    {
        title: "operation.label_performance",
        dataIndex: "performance",
        render: val => {
            const n = val.times(100).toFixed(2);
            const text =
                n < performance_low
                    ? i18n.t("pool.label_poor")
                    : n > performance_high
                    ? i18n.t("pool.label_excellent")
                    : i18n.t("pool.label_moderate");

            return <span>{text}</span>;
        }
    },
    {
        title: "operation.label_stake_weight",
        dataIndex: "stakeWeight",
        render: val => {
            return <span>{val.times(100).toFixed(4)}%</span>;
        }
    },
    {
        title: "operation.label_capacity",
        render: val => {
            return (
                <span>
                    {Math.max(
                        0,
                        val.stakeSelf
                            .times(100)
                            .minus(val.stakeTotal)
                            .toNumber()
                    ).toFixed(4)}
                </span>
            );
        }
    },
    {
        title: "operation.label_self_bond",
        dataIndex: "stakeSelf",
        render: val => {
            return <span>{val.toNumber().toFixed(4)}</span>;
        }
    },
    {
        title: "operation.label_total_staked",
        dataIndex: "stakeTotal",
        render: val => {
            return <span>{val.toNumber().toFixed(4)}</span>;
        }
    }
];
const accountDetailInfo = [
    {
        title: "operation.label_account_stake",
        dataIndex: "stake",
        render: val => (
            <>
                <span>{`${val.toFixed(5)} `}</span>
                <img src={aionLogo} width="16" height="16" alt="" />
            </>
        )
    },
    {
        title: "operation.label_account_rewards",
        dataIndex: "rewards",
        render: val => (
            <>
                <span>{`${val.toFixed(5)} `}</span>
                <img src={aionLogo} width="16" height="16" alt="" />
            </>
        )
    }
];

const renderPoolDetail = (info, src) => {
    return info.map(el => {
        const { dataIndex, title, render } = el;
        const val = dataIndex ? src[dataIndex] : src;
        if (render) {
            return (
                <div key={title} className="operation-pool-detail-item">
                    <div className="operation-pool-detail-item-value">
                        {render(val)}
                    </div>
                    <div className="operation-pool-detail-item-title">
                        {i18n.t(title)}
                    </div>
                </div>
            );
        }
        return (
            <div key={title} className="operation-pool-detail-item">
                <div className="operation-pool-detail-item-value">
                    {val.toString()}
                </div>
                <div className="operation-pool-detail-item-title">
                    {i18n.t(title)}
                </div>
            </div>
        );
    });
};

const renderAccountDetail = (info, src) => {
    return info.map(el => {
        const { dataIndex, title, render } = el;
        const val = dataIndex ? src[dataIndex] : src;
        if (render) {
            return (
                <div key={title} className="operation-account-info">
                    <div className="operation-account-info-value">
                        {render(val)}
                    </div>
                    <div className="operation-account-info-title">
                        {i18n.t(title)}
                    </div>
                </div>
            );
        }
        return (
            <div key={title} className="operation-account-info">
                <div className="ooperation-account-info-value">
                    {val.toString()}
                </div>
                <div className="operation-account-info-title">
                    {i18n.t(title)}
                </div>
            </div>
        );
    });
};

const checkoutAccount = (cb: () => any) => {
    if (makkii.isconnect()) {
        if (!store.getState().account.address) {
            alert({
                title: i18n.t("error_title"),
                message: i18n.t("error_no_account"),
                actions: [
                    {
                        title: i18n.t("button_ok"),
                        onPress: handleSwitchAccount
                    }
                ]
            });
        } else {
            cb();
        }
    } else {
        alert({
            title: i18n.t("error_title"),
            message: i18n.t("error_no_makkii"),
            actions: [
                {
                    title: i18n.t("button_ok"),
                    onPress: () => {
                        window.location.href =
                            "https://www.chaion.net/download/makkii_latest.apk";
                    }
                }
            ]
        });
    }
};

const toDelegate = () => {
    checkoutAccount(() => {
        store.dispatch(
            createAction("account/update")({
                operation: {
                    ...store.getState().account.operation,
                    type: operationType.delegate
                }
            })
        );
        history.push("/delegate");
    });
};

const toUndelegate = () => {
    checkoutAccount(() => {
        store.dispatch(
            createAction("account/update")({
                operation: {
                    ...store.getState().account.operation,
                    type: operationType.undelegate
                }
            })
        );
        history.push("/undelegate");
    });
};

const toWithdraw = () => {
    checkoutAccount(() => {
        store.dispatch(
            createAction("account/update")({
                operation: {
                    ...store.getState().account.operation,
                    type: operationType.withdraw
                }
            })
        );
        history.push("/withdraw");
    });
};

const toTransfer = () => {
    checkoutAccount(() => {
        store.dispatch(
            createAction("account/update")({
                operation: {
                    ...store.getState().account.operation,
                    type: ""
                }
            })
        );
        history.push("/transfer");
    });
};

const Pageoperation = () => {
    const [modalState, setModalState] = React.useState({
        visible: false,
        txHash: ""
    });

    const { operation } = store.getState().account;
    const pool: Ipool = store.getState().account.pools[operation.pool];
    const account = {
        address: store.getState().account.address,
        stake: useSelector(
            (state: { account: IAccountState }) =>
                (
                    state.account.delegations[operation.pool] || {
                        stake: new BigNumber(0)
                    }
                ).stake,
            (l, r) => l.toNumber() === r.toNumber()
        ),
        rewards: useSelector(
            (state: { account: IAccountState }) =>
                (
                    state.account.delegations[operation.pool] || {
                        rewards: new BigNumber(0)
                    }
                ).rewards,
            (l, r) => l.toNumber() === r.toNumber()
        )
    };
    const commissionRateChanges = useSelector(
        (state: { account: IAccountState }) =>
            state.account.commissionRateChanges,
        shallowEqual
    );
    const autoDelegationRewards = useSelector(
        (state: { account: IAccountState }) =>
            (
                state.account.delegations[operation.pool] || {
                    auto_delegate_rewards: false
                }
            ).auto_delegate_rewards
    );
    React.useEffect(() => {
        if (!operation.pool) {
            history.replace("/poolList");
        }
    }, [operation]);

    React.useEffect(() => {
        wsSend({
            method: "commission_rate_changes",
            params: [operation.pool, 0, 50]
        });
        return () => {
            store.dispatch(
                createAction("account/update")({ commissionRateChanges: [] })
            );
        };
    }, []);

    const handle_toggle = async v => {
        const {
            liquidBalance,
            operation: { pool: poolAddress }
        }: IAccountState = store.getState().account;
        const gasLimit = new BigNumber(
            v ? gas_enable_auto_delegate : gas_disable_auto_delegate
        );
        if (
            liquidBalance.isLessThan(
                gasLimit.times(gasPrice).shiftedBy(AIONDECIMAL)
            )
        ) {
            // gas limit insufficient
            alert({
                title: "",
                message: ""
            });
        }
        let res;
        if (v) {
            res = await call_enable_auto_delegate(poolAddress);
        } else {
            res = await call_disable_auto_delegate(poolAddress);
        }
        if (res) {
            // send success
            setModalState({
                visible: true,
                txHash: res
            });
        } else {
            // send fail
            alert({
                title: i18n.t("error_title"),
                message: i18n.t("error_sent_fail"),
                actions: [
                    {
                        title: i18n.t("button_ok")
                    }
                ]
            });
        }
    };

    const hideModal = () => {
        setModalState({
            visible: false,
            txHash: ""
        });
    };

    const accountLabel = () => {
        if (!account) return null;
        return (
            <div className="operation-account">
                {renderAccountDetail(accountDetailInfo, account)}
                <CommonButton
                    className="operation-button button-orange"
                    title={i18n.t("operation.button_unDelegate")}
                    onClick={toUndelegate}
                    disabled={account.stake.toNumber() === 0}
                />
                <CommonButton
                    className="operation-button button-orange"
                    title={i18n.t("operation.button_withdraw_all")}
                    onClick={toWithdraw}
                    disabled={account.rewards.toNumber() === 0}
                />
            </div>
        );
    };
    if (!operation.pool) {
        return <div />;
    }

    const {
        meta: { logo, name, url },
        active,
        address: poolAddress
    } = pool;
    const hasDelegated = account && account.stake.isGreaterThan(0);
    const notSelfBond = account.address !== pool.address;
    return (
        <div className="operation-container">
            <div className="operation-pool-basic">
                <div>
                    <Image src={logo} alt="" />
                </div>
                <ul>
                    {name && <li>{name}</li>}
                    <li>
                        <span
                            className={active ? "poolActive" : "poolInActive"}
                        />{" "}
                        {active
                            ? i18n.t("pool.label_active")
                            : i18n.t("pool.label_inActive")}
                    </li>
                    <li>{formatAddress(poolAddress)}</li>
                    {url && (
                        <li>
                            <a href={url} rel="noopener noreferrer">
                                {url}
                            </a>
                        </li>
                    )}
                </ul>
            </div>
            <div className="delimiter" />
            {accountLabel()}
            <div className="operation-pool-detail">
                {renderPoolDetail(poolDetailInfo, pool)}
            </div>
            <CommonButton
                disabled={!active}
                title={i18n.t("operation.button_delegate")}
                onClick={toDelegate}
                className="button-orange operation-basic-button"
            />
            {hasDelegated ? (
                <>
                    {notSelfBond ? (
                        <CommonButton
                            title={i18n.t("operation.button_transfer")}
                            onClick={toTransfer}
                            className="button-orange operation-basic-button"
                        />
                    ) : null}

                    <div className="operation-switch">
                        <span>
                            {i18n.t("operation.label_auto_delegate_rewards")}
                        </span>
                        <Switch
                            className="operation-switch-button"
                            value={autoDelegationRewards}
                            handleToggle={handle_toggle}
                        />
                    </div>
                </>
            ) : null}
            <CommissionRateChangeList
                commissionRateChanges={commissionRateChanges}
                pool={pool}
            />
            <Modal
                visible={modalState.visible}
                title=""
                hide={hideModal}
                actions={[
                    {
                        title: (
                            <div className="button button-orange">
                                {i18n.t("button_ok")}
                            </div>
                        ),
                        onPress: () => {
                            history.replace("/home");
                        }
                    }
                ]}
                className="tx_result_modal"
            >
                <CheckMark width={40} height={40} />
                <p>
                    {i18n.t("modal.sent_success_msg1")}
                    <br />
                    {i18n.t("modal.sent_success_msg2")}
                </p>
                <p>{i18n.t("modal.sent_success_msg3")}</p>
                <p>
                    {formatAddress(modalState.txHash)}
                    <img
                        src={require("@/img/copy2.png")}
                        onClick={() => {
                            copyInputValue(modalState.txHash);
                        }}
                        alt=""
                    />
                </p>
            </Modal>
        </div>
    );
};

export default Pageoperation;
