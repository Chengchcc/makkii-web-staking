import React from 'react';
import IconLeft from '@img/arrow_left.svg';
import './style.less';

interface InavBar {
    onLeftClick: ()=>void
}

const navBar: React.FC<InavBar> = props => {
    const {onLeftClick} = props;
    return (
        <div className='navBar'>
            <div className='navButton' onClick={onLeftClick}>
                <IconLeft height={20} width={20} />           
            </div>
        </div>
    )
}

export default navBar