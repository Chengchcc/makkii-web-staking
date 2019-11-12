import React from 'react';
import SwipeAction from "@components/swipe_action";
import './style.less';

interface Icard {
    title: string,
    lists: any,
    handleMore: () => void,
    renderItem: (data: any, key?) => React.ReactNode
}
const card: React.FC<Icard> = (props) => {

    const { title, lists, renderItem, handleMore } = props;

    return (
        <div className='card-container'>
            <div key='card-header' className='card-header'>
                <span>{title}</span>
                <span><a onClick={() => handleMore()}>{"More >"}</a></span>
            </div>
            <div className='card-body'>
                <ul>
                    {
                        lists.map((el, index) =>
                            // eslint-disable-next-line react/no-array-index-key
                            <li key={`${index}`}><SwipeAction>{renderItem(el)}</SwipeAction></li>
                        )
                    }
                </ul>
            </div>
        </div>
    )
}

export default card;
