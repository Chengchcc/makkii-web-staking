
// import React, { Component } from 'react'
// import { findDOMNode } from 'react-dom';
// import { STATS } from './constants';
// import HeadNode from './HeadNode';
// import FooterNode from './FooterNode';

// function addEvent(obj, type, fn) {
//     if (obj.attachEvent) {
//         obj[`e${  type  }${fn}`] = fn;
//         obj[type + fn] = function () { obj[`e${  type  }${fn}`](window.event); }
//         obj.attachEvent(`on${  type}`, obj[type + fn]);
//     } else
//         obj.addEventListener(type, fn, false, { passive: false });
// }
// function removeEvent(obj, type, fn) {
//     if (obj.detachEvent) {
//         obj.detachEvent(`on${  type}`, obj[type + fn]);
//         obj[type + fn] = null;
//     } else
//         obj.removeEventListener(type, fn, false);
// }


// interface IProps {
//     action: string
//     handleAction: (data: any) => any
//     haseMore?: boolean
//     offsetScrollTop?: number
//     downEnough?: number
//     distanceBottom?: number
//     isBlockContainer?: boolean
//     HeadNode?: any
//     FooterNode?: any
//     className?: string
// }

//  const defaultProps = {
//     hasMore: true,
//     offsetScrollTop: 1,
//     downEnough: 100,
//     distanceBottom: 100,
//     isBlockContainer: false,
//     className: "",
//     HeadNode,     // refresh message react dom
//     FooterNode, // refresh loading react dom
// };
// export default class ReactPullLoad extends Component<IProps, {}> {
//     // set props default values
   

//     state = {
//         pullHeight: 0
//     };

//     defaultConfig: any;

//     startX: any;

//     startY: any;

//     // container = null;

//     componentDidMount() {
//         const { isBlockContainer, offsetScrollTop, downEnough, distanceBottom } = this.props
//         this.defaultConfig = {
//             container: isBlockContainer ? findDOMNode(this) : document.body,
//             offsetScrollTop,
//             downEnough,
//             distanceBottom
//         };
//         // console.info("downEnough = ", downEnough, this.defaultConfig.downEnough)
//         /*
//           As below reason handle touch event self ( widthout react defualt touch)
//           Unable to preventDefault inside passive event listener due to target being treated as passive. See https://www.chromestatus.com/features/5093566007214080
//         */
//         addEvent(this.refs.container, "touchstart", this.onTouchStart)
//         addEvent(this.refs.container, "touchmove", this.onTouchMove)
//         addEvent(this.refs.container, "touchend", this.onTouchEnd)
//     }

//     // 未考虑到 children 及其他 props 改变的情况
//     // shouldComponentUpdate(nextProps, nextState) {
//     //   if(this.props.action === nextProps.action && this.state.pullHeight === nextState.pullHeight){
//     //     //console.info("[ReactPullLoad] info new action is equal to old action",this.state.pullHeight,nextState.pullHeight);
//     //     return false
//     //   } else{
//     //     return true
//     //   }
//     // }

//     componentWillUnmount() {
//         removeEvent(this.refs.container, "touchstart", this.onTouchStart)
//         removeEvent(this.refs.container, "touchmove", this.onTouchMove)
//         removeEvent(this.refs.container, "touchend", this.onTouchEnd)
//     }

//     componentWillReceiveProps(nextProps) {
//         if (nextProps.action === STATS.refreshed) {
//             setTimeout(() => {
//                 this.props.handleAction(STATS.reset)
//             }, 1000)
//         }
//     }

//     getScrollTop = () => {
//         if (this.defaultConfig.container) {
//             if (this.defaultConfig.container === document.body) {
//                 return document.documentElement.scrollTop || document.body.scrollTop;
//             }
//             return this.defaultConfig.container.scrollTop;
//         } 
//             return 0;
        
//     }

//     setScrollTop = (value) => {
//         if (this.defaultConfig.container) {
//             let scrollH = this.defaultConfig.container.scrollHeight;
//             if (value < 0) { value = 0 }
//             if (value > scrollH) { value = scrollH }
//             return this.defaultConfig.container.scrollTop = value;
//         } 
//             return 0;
        
//     }

//     // 拖拽的缓动公式 - easeOutSine
//     easing = (distance) => {
//         // t: current time, b: begInnIng value, c: change In value, d: duration
//         let t = distance;
//         let b = 0;
//         let d = screen.availHeight; // 允许拖拽的最大距离
//         let c = d / 2.5; // 提示标签最大有效拖拽距离

//         return c * Math.sin(t / d * (Math.PI / 2)) + b;
//     }

//     canRefresh = () => {
//         return [STATS.refreshing, STATS.loading].indexOf(this.props.action) < 0;
//     }

//     onPullDownMove = (data) => {
//         if (!this.canRefresh()) return false;

//         let loaderState; let diff = data[0].touchMoveY - data[0].touchStartY;
//         if (diff < 0) {
//             diff = 0;
//         }
//         diff = this.easing(diff);
//         if (diff > this.defaultConfig.downEnough) {
//             loaderState = STATS.enough
//         } else {
//             loaderState = STATS.pulling
//         }
//         this.setState({
//             pullHeight: diff,
//         })
//         this.props.handleAction(loaderState)
//     }

//     onPullDownRefresh = () => {
//         if (!this.canRefresh()) return false;

//         if (this.props.action === STATS.pulling) {
//             this.setState({ pullHeight: 0 })
//             this.props.handleAction(STATS.reset)
//         } else {
//             this.setState({
//                 pullHeight: 0,
//             })
//             this.props.handleAction(STATS.refreshing)
//         }
//     }

//     onPullUpMove = (data) => {
//         if (!this.canRefresh()) return false;

//         // const { hasMore, onLoadMore} = this.props
//         // if (this.props.hasMore) {
//         this.setState({
//             pullHeight: 0,
//         })
//         this.props.handleAction(STATS.loading)
//         // }
//     }

//     onTouchStart = (event) => {
//         let targetEvent = event.changedTouches[0];
//         this.startX = targetEvent.clientX;
//         this.startY = targetEvent.clientY;
//     }

//     onTouchMove = (event) => {
//         const scrollTop = this.getScrollTop();
//             let scrollH = this.defaultConfig.container.scrollHeight;
//             let conH = this.defaultConfig.container === document.body ? document.documentElement.clientHeight : this.defaultConfig.container.offsetHeight;
//             let targetEvent = event.changedTouches[0];
//             let curX = targetEvent.clientX;
//             let curY = targetEvent.clientY;
//             let diffX = curX - this.startX;
//             let diffY = curY - this.startY;

//         // 判断垂直移动距离是否大于5 && 横向移动距离小于纵向移动距离
//         if (Math.abs(diffY) > 5 && Math.abs(diffY) > Math.abs(diffX)) {
//             // 滚动距离小于设定值 &&回调onPullDownMove 函数，并且回传位置值
//             if (diffY > 5 && scrollTop < this.defaultConfig.offsetScrollTop) {
//                 // 阻止执行浏览器默认动作
//                 event.preventDefault();
//                 this.onPullDownMove([{
//                     touchStartY: this.startY,
//                     touchMoveY: curY
//                 }]);
//             } // 滚动距离距离底部小于设定值
//             else if (diffY < 0 && (scrollH - scrollTop - conH) < this.defaultConfig.distanceBottom) {
//                 // 阻止执行浏览器默认动作
//                 // event.preventDefault();
//                 this.onPullUpMove([{
//                     touchStartY: this.startY,
//                     touchMoveY: curY
//                 }]);
//             }
//         }
//     }

//     onTouchEnd = (event) => {
//         let scrollTop = this.getScrollTop();
//             let targetEvent = event.changedTouches[0];
//             let curX = targetEvent.clientX;
//             let curY = targetEvent.clientY;
//             let diffX = curX - this.startX;
//             let diffY = curY - this.startX;

//         // 判断垂直移动距离是否大于5 && 横向移动距离小于纵向移动距离
//         if (Math.abs(diffY) > 5 && Math.abs(diffY) > Math.abs(diffX)) {
//             if (diffY > 5 && scrollTop < this.defaultConfig.offsetScrollTop) {
//                 // 回调onPullDownRefresh 函数，即满足刷新条件
//                 this.onPullDownRefresh();
//             }
//         }
//     }

//     render() {
//         const {
//             children,
//             action,
//             handleAction,
//             hasMore,
//             className,
//             offsetScrollTop,
//             downEnough,
//             distanceBottom,
//             isBlockContainer,
//             HeadNode,
//             FooterNode,
//             ...other
//         } = this.props

//         const { pullHeight } = this.state

//         const msgStyle = pullHeight ? {
//             WebkitTransform: `translate3d(0, ${pullHeight}px, 0)`,
//             transform: `translate3d(0, ${pullHeight}px, 0)`
//         } : null;

//         const boxClassName = `${className} pull-load state-${action}`;

//         return (
//             <div {...other}
//                 className={boxClassName}
//                 ref="container">
//                 <div className="pull-load-body" style={msgStyle}>
//                     <div className="pull-load-head">
//                         <HeadNode loaderState={action} />
//                     </div>
//                     {children}
//                     <div className="pull-load-footer">
//                         <FooterNode loaderState={action} hasMore={hasMore} />
//                     </div>
//                 </div>
//             </div>
//         )
//     }
// }
