import React from "react";
import ReactDOM from "react-dom";
import i18n from "@utils/i18n";
import Modal, { Iaction } from "./modal";
import withPortal from "./modalPortal";

export default withPortal(Modal);

export const alert = (props: {
    title: string;
    message: string;
    actions?: Array<Iaction>;
    afterHide?: () => void;
    className?: string;
}) => {
    const { title, message, actions, className, afterHide } = props;
    const modalRoot = document.body;
    const div = document.createElement("div");
    div.setAttribute("style", "position:relative;z-index: 5001");
    modalRoot.appendChild(div);
    const hide = () => {
        ReactDOM.unmountComponentAtNode(div);
        if (div && div.parentNode) {
            div.parentNode.removeChild(div);
        }
        if (afterHide) afterHide();
    };
    ReactDOM.render(
        <Modal
            maskClosable
            visible
            title={title}
            hide={hide}
            actions={actions}
            className={`modal-alert ${className}`}
        >
            {message}
        </Modal>,
        div
    );
};

export const TransactionAlert = (
    onBack: (...args: any[]) => void,
    onContinue: (...args: any[]) => void
) => {
    return alert({
        title: i18n.t("transaction.alert_title"),
        message: i18n.t("transaction.alert_message"),
        actions: [
            {
                title: i18n.t("transaction.button_cancel"),
                onPress: () => onBack()
            },
            {
                title: i18n.t("transaction.button_continue"),
                onPress: () => onContinue()
            }
        ],
        className: "modal-tx-alert",
        afterHide: () => onBack()
    });
};
