import React from 'react';
import IconLeft from '@img/arrow_left.svg';
import './style.less';

interface InavBar {
    onLeftClick: ()=>void
}

const navBar: React.FC<InavBar> = props => {
    const {onLeftClick, title} = props;
    return (
        <div className='navBar'>
            <div className='navButton' onClick={onLeftClick}>
                <IconLeft height={20} width={20} />
            </div>
            {title}
        </div>
    )
}

export default navBar
