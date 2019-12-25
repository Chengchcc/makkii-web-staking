/* eslint-disable jsx-a11y/label-has-associated-control */
import React from "react";
import "./style.less";

const Switch = ({ value, handleToggle, className = "" }) => {
    const [checked, setChecked] = React.useState(false);
    React.useEffect(() => {
        setChecked(value);
    }, [value]);
    const cls = `switch-container ${className}`;
    return (
        <div className={cls}>
            <input
                checked={checked}
                onChange={() => {
                    setChecked(!checked);
                    handleToggle(!checked);
                }}
                className="react-switch-checkbox"
                type="checkbox"
            />
            <div>
                <div />
            </div>
        </div>
    );
};

export default Switch;
