/* eslint-disable no-plusplus */
import React from "react";

let id = 0;
interface IformItem {
    label: string;
    className?: string;
}
const FormItem: React.FC<IformItem> = props => {
    const { label, children, className } = props;
    const cls = `${className} operation-form-value`;
    return (
        <div key={`${id++}`} className="operation-form-item ">
            <div className="operation-form-label">{`${label}:`}</div>
            <div className={cls}>{children}</div>
        </div>
    );
};

export default FormItem;
