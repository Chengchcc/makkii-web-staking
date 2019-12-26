import React from "react";
import { useSelector } from "react-redux";
import { operationType } from "@reducers/accountReducer";
import { formatAddress, validateAmount, getPoolLogo } from "@utils/index";
import { gas_delegate, gasPrice, AIONDECIMAL } from "@utils/constants.json";
import BigNumber from "bignumber.js";
import { CommonButton } from "@components/button";
import { call_delegate } from "@utils/transaction";
import Modal, { alert } from "@components/modal";
import Image from "@components/default-img";
import { copyInputValue } from "@utils/util";
import i18n from "@utils/i18n";
import { send_event_log } from "@utils/httpclient";
import store from "@reducers/store";
import FormItem from "../operation_form_item";
import { commonGoback } from "../util";
import CheckMark from "@/img/checkMark.svg";
import "../style.less";

const fee_delegate = new BigNumber(gas_delegate)
    .times(gasPrice)
    .shiftedBy(AIONDECIMAL);

const maptoState = ({ account }) => {
    return {
        account: {
            address: account.address,
            balance: account.liquidBalance
        }
    };
};

const delegate = props => {
    const [modalState, setModalState] = React.useState({
        visible: false,
        txHash: ""
    });
    const { operation, pools } = store.getState().account;
    const {
        account
    }: {
        account: {
            address: string;
            balance: BigNumber;
        };
    } = useSelector(maptoState, (l, r) => {
        return (
            l.account.address === r.account.address &&
            l.account.balance.toNumber() === r.account.balance.toNumber()
        );
    });
    const { history } = props;
    const inputRef = React.useRef(null);
    React.useEffect(() => {
        if (operationType.delegate !== operation.type) {
            history.replace("/operation");
        }
    }, [operation]);
    const pool = pools[operation.pool];
    const { meta } = pool;
    const { address, balance } = account;
    const handle_delegate = async (e: MouseEvent) => {
        e.preventDefault();
        const amount = inputRef.current.value;
        const valid = validateAmount(amount);
        const insufficientBalance = new BigNumber(amount)
            .plus(fee_delegate)
            .gt(balance);
        if (!valid || parseFloat(amount) === 0 || insufficientBalance) {
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
        const res = await call_delegate(operation.pool, amount);
        if (res) {
            send_event_log({
                user: "staking",
                event: "STAKING_DELEGATE",
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
    const poolLogo = getPoolLogo(pool);
    return (
        <div className="operation-container delegate-form">
            <FormItem label={i18n.t("operation_form.label_from")}>
                {formatAddress(address)}
            </FormItem>
            <FormItem
                label={i18n.t("operation_form.label_to")}
                className="operation-form-pool"
            >
                <Image src={poolLogo} className="pool-logo" alt="" />
                <span style={{ marginLeft: "10px" }}>
                    {meta.name || address}
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
            <FormItem label={i18n.t("operation_form.label_balance")}>
                {balance.toFixed(5)} AION
            </FormItem>
            <FormItem
                label={i18n.t("operation_form.label_delegate_amount")}
                className="delegate-input"
            >
                <input ref={inputRef} type="number" /> &nbsp; AION &nbsp;
                <a
                    className="button button-orange"
                    onClick={e => {
                        e.preventDefault();
                        const amount = balance.minus(fee_delegate);
                        inputRef.current.value = amount.gte(0)
                            ? balance.minus(fee_delegate).toString()
                            : "0";
                    }}
                >
                    {i18n.t("button_all")}
                </a>
            </FormItem>
            <CommonButton
                title={i18n.t("operation.button_delegate")}
                className="button-orange"
                onClick={handle_delegate}
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
delegate.goBack = commonGoback;

export default delegate;
