/* eslint-disable react/no-array-index-key */
import React from "react";

export interface Iaction {
    title: any;
    onPress?: () => any;
}
export interface ModalProps {
    visible: boolean;
    className?: string;
    title: string;
    maskClosable?: boolean;
    hide: () => void;
    actions?: Array<Iaction>;
    children?: React.ReactNode;
}

export const ModalDefaultProps: ModalProps = {
    visible: false,
    title: "demo",
    maskClosable: false,
    className: "",
    hide: () => {}
};

const Modal: React.FC<ModalProps> = props => {
    const { className, title, children, actions, hide, maskClosable } = props;

    const boxClassName = `modal-body ${className}`;
    const footer = actions
        ? actions.map((el, index) => {
              return (
                  <div
                      key={`${index}`}
                      className="modal-footer-button"
                      onClick={e => {
                          e.preventDefault();
                          if (el.onPress) {
                              el.onPress();
                          }
                          hide();
                      }}
                  >
                      {el.title}
                  </div>
              );
          })
        : null;
    const footerGrid = {
        gridTemplateColumns: `repeat(${actions.length}, ${100 /
            actions.length}%)`
    };
    console.log("footerGrid", footerGrid);
    return (
        <div
            className="modal-container"
            onClick={e => {
                e.preventDefault();
                if (maskClosable) {
                    hide();
                }
            }}
        >
            <div className={boxClassName} onClick={e => e.preventDefault()}>
                <div className="modal-title">{title}</div>
                <div className="modal-content">{children && children}</div>
                <div className="modal-footer" style={footerGrid}>
                    {footer}
                </div>
            </div>
        </div>
    );
};

Modal.defaultProps = ModalDefaultProps;

export default Modal;
