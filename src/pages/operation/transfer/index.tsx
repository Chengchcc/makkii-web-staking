import React from "react";
import { useSelector } from "react-redux";
import { formatAddress, validateAmount, getPoolLogo } from "@utils/index";
import {
    gas_delegate,
    gasPrice,
    AIONDECIMAL,
    transfer_lock_blocks
} from "@utils/constants.json";
import BigNumber from "bignumber.js";
import { CommonButton } from "@components/button";
import { call_transfer } from "@utils/transaction";
import Modal, { alert } from "@components/modal";
import Image from "@components/default-img";
import { copyInputValue } from "@utils/util";
import i18n from "@utils/i18n";
// import { send_event_log } from "@utils/httpclient";
import IconRight from "@img/arrow_right.svg";
import store from "@reducers/store";
import FormItem from "../operation_form_item";
import { commonGoback } from "../util";
import CheckMark from "@/img/checkMark.svg";
import "../style.less";

const fee_delegate = new BigNumber(gas_delegate)
    .times(gasPrice)
    .shiftedBy(AIONDECIMAL);

const maptoState = ({ account }) => {
    const { delegations, operation } = account;
    const delegation = delegations[operation.pool] || {};
    return {
        account: {
            address: account.address,
            staked: delegation.stake || new BigNumber(0)
        }
    };
};

const PageTransfer = props => {
    const [modalState, setModalState] = React.useState({
        visible: false,
        txHash: ""
    });
    const {
        account
    }: {
        account: {
            address: string;
            staked: BigNumber;
        };
    } = useSelector(maptoState, (l, r) => {
        return (
            l.account.address === r.account.address &&
            l.account.staked.toNumber() === r.account.staked.toNumber()
        );
    });
    const { pools, operation } = store.getState().account;
    const { history } = props;
    const inputRef = React.useRef(null);

    React.useEffect(() => {
        if (typeof operation.type !== "string") {
            history.replace("/operation");
        }
    }, [operation]);

    const { staked } = account;
    const handle_transfer = async (e: MouseEvent) => {
        e.preventDefault();
        const to = operation.type;
        if (!to) {
            alert({
                title: i18n.t("error_title"),
                message: i18n.t("error_to_address_empty"),
                actions: [
                    {
                        title: i18n.t("button_ok")
                    }
                ]
            });
            return;
        }
        const amount = inputRef.current.value;
        const valid = validateAmount(amount);
        if (!valid || parseFloat(amount) === 0) {
            alert({
                title: i18n.t("error_title"),
                message: i18n.t("error_invalid_amount"),
                actions: [
                    {
                        title: i18n.t("button_ok")
                    }
                ]
            });
            return;
        }
        const res = await call_transfer(operation.pool, operation.type, amount);
        if (res) {
            // send_event_log({
            //     user: "staking",
            //     event: "STAKING_DELEGATE",
            //     data: {
            //         amount,
            //         pool_address: operation.pool,
            //         pool_name: meta.name
            //     }
            // });

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

    const pool_from_address = operation.pool;
    const pool_to_address = operation.type;
    const pool_from: any = pools[pool_from_address] || {};
    const pool_to: any = pools[pool_to_address] || {};
    const pool_from_logo = getPoolLogo(pool_from);
    const pool_to_logo = getPoolLogo(pool_to);

    return (
        <div className="operation-container delegate-form">
            <FormItem
                label={i18n.t("operation_form.label_from")}
                className="operation-form-pool"
            >
                <Image src={pool_from_logo} className="pool-logo" alt="" />
                <span style={{ marginLeft: "10px" }}>
                    {(!!pool_from.meta && pool_from.meta.name) ||
                        pool_from.address}
                </span>
            </FormItem>
            <FormItem
                label={i18n.t("operation_form.label_to")}
                className="operation-form-pool"
            >
                {pool_to.address ? (
                    <>
                        <Image
                            src={pool_to_logo}
                            className="pool-logo"
                            alt=""
                        />
                        <span style={{ marginLeft: "10px" }}>
                            {(pool_to.meta && pool_to.meta.name) ||
                                pool_to.address}
                        </span>
                    </>
                ) : (
                    i18n.t("operation_form.label_transfer_to")
                )}
                <span
                    style={{ position: "absolute", right: "10px" }}
                    onClick={() => {
                        history.push("/poolList");
                    }}
                >
                    <IconRight className="pool-detail-img" />
                </span>
            </FormItem>
            <FormItem label={i18n.t("operation_form.label_tx_fee")}>
                ≈ {fee_delegate.toFixed(5)}&nbsp;{" "}
                <img
                    src={require("@/img/metaLogo2.png")}
                    width="14"
                    height="14"
                    alt=""
                />
            </FormItem>
            <FormItem
                label={i18n.t("operation_form.label_lock_period")}
            >{`${transfer_lock_blocks} ${i18n.t("unit_block")} ≈ 10 ${i18n.t(
                "unit_minute"
            )}`}</FormItem>
            <FormItem label={i18n.t("operation_form.label_delegate_amount")}>
                {staked.toFixed(5)} AION
            </FormItem>
            <FormItem
                label={i18n.t("operation_form.label_transfer_amount")}
                className="delegate-input"
            >
                <input ref={inputRef} type="number" /> &nbsp; AION &nbsp;
                <a
                    className="button button-orange"
                    onClick={e => {
                        e.preventDefault();
                        const amount = staked.minus(fee_delegate);
                        inputRef.current.value = amount.gte(0)
                            ? staked.toString()
                            : "0";
                    }}
                >
                    {i18n.t("button_all")}
                </a>
            </FormItem>
            <CommonButton
                title={i18n.t("operation.button_transfer")}
                className="button-orange"
                onClick={handle_transfer}
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
PageTransfer.goBack = commonGoback;

export default PageTransfer;
