import React from 'react';
import ReactPullLoad, { STATS } from '@components/pullLoad';
import Spin from '@components/spin'
import SwipeAction from "@components/swipe_action";
import './style.less';

interface Ilist<T> {
    title: string
    data: Array<T>
    renderItem: (item: T, index?: number) => React.ReactElement<any>
    onRefresh: () => any
    onReachEnd: () => any
    hasMore: boolean
}


const List: React.FC<Ilist<any>> = props => {
    const { title, data, renderItem, onReachEnd, onRefresh, hasMore } = props;
    const [state, setState] = React.useState({
        action: STATS.init,
        isLoading: true
    })
    const handleAction = (action) => {
        if (action === state.action ||
            action === STATS.refreshing && state.action === STATS.loading ||
            action === STATS.loading && state.action === STATS.refreshing) {
            // console.info("It's same action or on loading or on refreshing ",action, state.action,action === state.action);
            return
        }
        if (action === STATS.refreshing) {// refreshing
            onRefresh();
        } else if (action === STATS.loading) {// loading more
            onReachEnd();
        }
        // DO NOT modify below code
        setState({
            ...state,
            action
        })
    }

    React.useEffect(() => {
        const newState = {...state};
        let update = false;
        if (state.isLoading&&data.length>0) {
            newState.isLoading = false
            update = true;
        }
        if (state.action === STATS.refreshing) {
            newState.action = STATS.refreshed
            update = true;
        } else if (state.action === STATS.loading) {
            newState.action = STATS.reset
            update = true;
        }
        if(update){
            setState(newState)
        }

    }, [data]);
    const style = {height: window.innerHeight - 80}
    let startX = 0
    return (
        <div style={{ margin: 0, padding: 0,overflow:"hidden" }}>
            <div className='list-title'>{title}</div>
            {
                !state.isLoading ?
                    <ReactPullLoad
                        downEnough={150}
                        className="loadList"
                        isBlockContainer
                        style={style}
                        action={state.action}
                        handleAction={handleAction}
                        hasMore={hasMore}
                        distanceBottom={1}>
                        <ul>
                            {
                                data.map((item, index) => {
                                    // eslint-disable-next-line react/no-array-index-key
                                    return <li key={index}><SwipeAction>{renderItem(item, index)}</SwipeAction></li>
                                })
                            }
                        </ul>
                    </ReactPullLoad>
                    :
                    <div style={{ display: 'flex',height:'100%', alignItems: 'center', justifyContent: 'center' }}>
                        <Spin />
                    </div>
            }
        </div>
    )
}


export default List;
