/* eslint-disable no-param-reassign */
import React from 'react';
import { STATS } from './constants';
import HeadNode_ from './HeadNode';
import FooterNode_ from './FooterNode';
import './style.less';

export {
    STATS
}

interface Iprops {
    action: STATS
    handleAction: (...data:any) => any
    hasMore?: boolean
    offsetScrollTop?: number
    downEnough?: number
    distanceBottom?: number
    isBlockContainer?: boolean
    HeadNode?: any
    FooterNode?: any
    className?: string
    style?: Object
}


const defaultProps = {
    offsetScrollTop: 1,
    downEnough: 100,
    distanceBottom: 100,
    isBlockContainer: false,
    className: "",
    HeadNode:HeadNode_,     // refresh message react dom
    FooterNode: FooterNode_, // refresh loading react dom
}


const easing = distance => {
    const t = distance;
    const b = 0;
    const d = window.screen.availHeight;
    const c = d / 2.5;
    return c * Math.sin(t / d * (Math.PI / 2)) + b;
}

let startX = 0;
let startY = 0;

let Tcontainer = document.body;
const pullLoad: React.FC<Iprops> = props => {

    const {offsetScrollTop, downEnough, distanceBottom, handleAction, style={}, hasMore, HeadNode, FooterNode} = props;

    const [state, setState] = React.useState({
        pullHeight: 0
    }) 

    const getScrollTop = ()=> {
        if(Tcontainer) {
            if(Tcontainer === document.body) {
                return document.documentElement.scrollTop || document.body.scrollTop;
            }
            return Tcontainer.scrollTop
        }
        return 0;
    }

    const canRefresh = () => {
        return [STATS.refreshing, STATS.loading].indexOf(props.action) < 0;
    }

    const onPullDownMove = data => {
        if(!canRefresh()) return;
        let loaderState;
        let diff = data[0].touchMoveY - data[0].touchStartY;
        if(diff<0) diff =0;
        diff = easing(diff);
        if(diff> downEnough) {
            loaderState = STATS.enough
        }else {
            loaderState = STATS.pulling
        }
        setState({
            pullHeight: diff,
        })
        handleAction(loaderState)
    }

    const onPullDownRefresh = ()=> {
        if(!canRefresh()) return;
        setState({pullHeight: 0})
        if(props.action === STATS.pulling) {
            handleAction(STATS.reset)
        }else {
            handleAction(STATS.refreshing)
        }
    }

    const onPullUpMove = () => {
        if(!canRefresh()||!hasMore) return;
        setState({pullHeight: 0})
        handleAction(STATS.loading)
    }

    const onTouchStart = (event: TouchEvent) => {
        const targetEvent = event.changedTouches[0];
        startX = targetEvent.clientX;
        startY = targetEvent.clientY;
    }

    const onTouchMove = (event: TouchEvent) => {
        const scrollTop = getScrollTop();
        const scrollH = Tcontainer.scrollHeight;
        const containerH = Tcontainer === document.body? document.documentElement.clientHeight:Tcontainer.offsetHeight;
        const targetEvent = event.changedTouches[0];
        const curX = targetEvent.clientX;
        const curY = targetEvent.clientY;
        const diffX = curX - startX;
        const diffY = curY - startY;
        if(Math.abs(diffY) > 5 && Math.abs(diffY) > Math.abs(diffX)) {
            if(diffY > 5 && scrollTop < offsetScrollTop) {
                event.preventDefault();
                onPullDownMove([{
                    touchMoveY: curY,
                    touchStartY: startY
                }]);
            }else if(diffY<0 && (scrollH - scrollTop - containerH) < distanceBottom) {
                onPullUpMove();
            }
        }
    }

    const onTouchEnd = (event: TouchEvent) => {
        const scrollTop = getScrollTop();
        const targetEvent = event.changedTouches[0];
        const curX = targetEvent.clientX;
        const curY = targetEvent.clientY;
        const diffX = curX - startX;
        const diffY = curY - startY;

        if(Math.abs(diffY) > 5 && Math.abs(diffY) > Math.abs(diffX)) {
            if(diffY > 5 && scrollTop < offsetScrollTop) {
                onPullDownRefresh();
            }
        }
    }

    React.useEffect(()=>{
        // add Listener
        Tcontainer = props.isBlockContainer?document.getElementById('pullLoadContainer'): document.body;
        Tcontainer.addEventListener('touchstart', onTouchStart)
        Tcontainer.addEventListener('touchmove', onTouchMove)
        Tcontainer.addEventListener('touchend', onTouchEnd)
        return ()=>{
            Tcontainer.removeEventListener('touchstart', onTouchStart)
            Tcontainer.removeEventListener('touchmove', onTouchMove)
            Tcontainer.removeEventListener('touchend', onTouchEnd)
        }
    });

    React.useEffect(()=>{
        if(props.action === STATS.refreshed){
            setTimeout(() => {
                handleAction(STATS.reset)
            }, 1000)
        }
    }, [props.action])
    const {pullHeight} = state;
    const msgStyle = pullHeight ? {
        WebkitTransform: `translate3d(0, ${pullHeight}px, 0)`,
        transform: `translate3d(0, ${pullHeight}px, 0)`
    } : null;
    const boxClassName = `${props.className} pull-load state-${props.action}`;
    const {children} = props;
    return (
        <div className={boxClassName} style={style} id='pullLoadContainer'>
            <div className="pull-load-body" style={msgStyle}>
                <div className="pull-load-head">
                    <HeadNode loaderState={props.action} />
                </div>
                {children}
                <div className="pull-load-footer">
                    <FooterNode loaderState={props.action} hasMore={props.hasMore} />
                </div>
            </div>
        </div>
    )
}


pullLoad.defaultProps = defaultProps;

export default pullLoad;