import React from 'react';
import './style.less';

interface ICommonButton {
    title: string
    onClick: (e)=>void
    className?: string,
    disabled?: boolean,
}

export const CommonButton:React.FC<ICommonButton> = props => {
    const {title, onClick, className, disabled = false} = props;
    const boxClass =disabled? `commonButton-disabled ${className}`: `commonButton ${className}`
    return (
        <div className={boxClass} onClick={e=>disabled||onClick(e)}>
            {title}
        </div>
    )
}