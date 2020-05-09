import React from "react";
import { useSelector } from "react-redux";
import { operationType } from "@reducers/accountReducer";
import { formatAddress, getPoolLogo } from "@utils/index";
import { gas_withdraw, gasPrice, AIONDECIMAL } from "@utils/constants.json";
import BigNumber from "bignumber.js";
import { CommonButton } from "@components/button";
import { call_withdraw } from "@utils/transaction";
import Modal, { alert } from "@components/modal";
import Image from "@components/default-img";
import { copyInputValue } from "@utils/util";
import i18n from "@utils/i18n";
import { send_event_log } from "@utils/httpclient";
import store from "@reducers/store";
import CheckMark from "@/img/checkMark.svg";
import FormItem from "../operation_form_item";
import { commonGoback } from "../util";
import "../style.less";

const fee_withdraw = new BigNumber(gas_withdraw)
    .times(gasPrice)
    .shiftedBy(AIONDECIMAL);

const maptoState = ({ account }) => {
    const { delegations, operation } = account;
    const delegation = delegations[operation.pool] || {};
    return {
        account: {
            address: account.address,
            rewards: delegation.rewards || new BigNumber(0)
        }
    };
};

const withdraw = props => {
    const [modalState, setModalState] = React.useState({
        visible: false,
        txHash: ""
    });
    const {
        account
    }: {
        account: {
            address: string;
            rewards: BigNumber;
        };
    } = useSelector(maptoState, (l, r) => {
        return (
            l.account.address === r.account.address &&
            l.account.rewards.toNumber() === r.account.rewards.toNumber()
        );
    });
    const { pools, operation } = store.getState().account;
    const { history } = props;
    React.useEffect(() => {
        if (operationType.withdraw !== operation.type) {
            history.replace("/operation");
        }
    }, [operation]);
    const pool = pools[operation.pool];
    const { meta } = pool;
    const { address, rewards } = account;
    const handle_withdraw = async (e: MouseEvent) => {
        e.preventDefault();
        const amount = rewards.toNumber();
        try {
            const res = await call_withdraw(operation.pool);
            if (res) {
                send_event_log({
                    user: "staking",
                    event: "STAKING_WITHDRAW",
                    data: {
                        amount,
                        pool_address: operation.pool,
                        pool_name: meta.name
                    }
                });

                // send success
                setModalState({
                    visible: true,
                    txHash: res
                });
            }
        } catch (err) {
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
    const poolLogo = getPoolLogo(pool);
    return (
        <div className="operation-container withdraw-form">
            <FormItem
                label={i18n.t("operation_form.label_from")}
                className="operation-form-pool"
            >
                <Image src={poolLogo} className="pool-logo" alt="" />
                <span style={{ marginLeft: "10px" }}>
                    {meta.name || address}
                </span>
            </FormItem>
            <FormItem label={i18n.t("operation_form.label_to")}>
                {formatAddress(address)}
            </FormItem>
            <FormItem label={i18n.t("operation_form.label_tx_fee")}>
                ≈ {fee_withdraw.toFixed(5)} AION
            </FormItem>
            <FormItem label={i18n.t("operation_form.label_withdraw_amount")}>
                <span>{rewards.toFixed(5)}&nbsp; AION</span>
            </FormItem>
            <CommonButton
                title={i18n.t("operation.button_withdraw")}
                className="button-orange"
                onClick={handle_withdraw}
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
withdraw.goBack = commonGoback;

export default withdraw;
