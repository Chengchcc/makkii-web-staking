import React from 'react';
import ReactPullLoad, { STATS } from 'react-pullload';
import './pullload.less';
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
    const { title, data, renderItem, onReachEnd, onRefresh,hasMore } = props;
    const [state, setState] = React.useState({
        action: STATS.init,
    })

    const handleAction = (action)=>{
        if(action === state.action ||
			action === STATS.refreshing && state.action === STATS.loading ||
			action === STATS.loading && state.action === STATS.refreshing){
			// console.info("It's same action or on loading or on refreshing ",action, state.action,action === state.action);
			return
		}
        if(action === STATS.refreshing){// refreshing
            onRefresh();
		} else if(action === STATS.loading){// loading more
            onReachEnd();
		}
		// DO NOT modify below code
		setState({
			action
		})
    }

    React.useEffect(()=>{
        console.log('effect: ', state)
        if(state.action === STATS.refreshing){
            setState({
                ...state,
                action: STATS.refreshed
            })
        }else if(state.action === STATS.loading) {
            setState({
                ...state,
                action: STATS.reset
            })
        }
    }, [data]);

    return (
        <div style={{ margin: 0, padding: 0 }}>
            <div className='list-title'>{title}</div>
            <ReactPullLoad
                downEnough={150}
                className="loadList"
                isBlockContainer
                action={state.action}
                handleAction={handleAction}
                style={{ paddingTop: 0 }}
                hasMore={hasMore}
                distanceBottom={1000}>
                <ul>
                    {
                        data.map((item, index) => {
                            // eslint-disable-next-line react/no-array-index-key
                            return <li key={index}>{renderItem(item,index)}</li>
                        })
                    }
                </ul>
            </ReactPullLoad>
        </div>
    )
}


export default List;