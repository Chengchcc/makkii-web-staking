import React from 'react';
import IconLeft from '@img/arrow_left.svg';
import './style.less';

interface InavBar {
    onLeftClick: ()=>void
    title: String,
    hide?: boolean
}

const navBar: React.FC<InavBar> = props => {
    const {onLeftClick, title, hide = false} = props;
    const style = hide? {display: 'none'}:{display:'block'} 
    return (
        <div className='navBar'>
            <div className='navButton' style={style} onClick={onLeftClick}>
                <IconLeft height={20} width={20} />
            </div>
            {title}
        </div>
    )
}

export default navBar
