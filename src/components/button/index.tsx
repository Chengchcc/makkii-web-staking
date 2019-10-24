import React from 'react';
import './style.less';

interface ICommonButton {
    title: string
    onClick: (e)=>void
    className?: string
}

export const CommonButton:React.FC<ICommonButton> = props => {
    const {title, onClick, className} = props;
    const boxClass = `commonButton ${className}`
    return (
        <div className={boxClass} onClick={onClick}>
            {title}
        </div>
    )
}