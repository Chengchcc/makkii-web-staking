import React from "react";
import ReactDOM from "react-dom";
import { ModalProps } from "./modal";
import "./modal.less";

const modalRoot = document.body;
const el = document.createElement("div");

const Portal = (WrappedComponent: React.ComponentClass<any> | React.FC) => (
    props: ModalProps
) => {
    const { visible } = props;
    React.useEffect(() => {
        modalRoot.appendChild(el);
        return () => modalRoot.removeChild(el);
    });
    return visible && el
        ? ReactDOM.createPortal(<WrappedComponent {...props} />, el)
        : null;
};

export default Portal;
