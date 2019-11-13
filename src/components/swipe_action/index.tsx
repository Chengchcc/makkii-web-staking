import React, { Component } from "react";
import "./index.less";

class SwipeAction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            left: 0,
            transition: ""
        };
        this.startX = 0;
        this.timer = null;
    }
    componentWillUnmount(): void {
        if(this.timer) clearTimeout(this.timer);
    }
    stopDefaultEvent(e) {
        e.preventDefault;
        e.returnValue = false;
        e.stopPropagation;
        return false;
    }
    render() {
        return (
         <div className="swiper-action">
             <div className="wsiper-action-content" onTouchStart={(e) => {
                 this.startX = e.touches[0].clientX;
                 this.stopDefaultEvent(e);
             }}
                  onTouchMove={(e) => {
                      const nowX = e.touches[0].clientX;
                      const diff = nowX - this.startX;
                      let res = this.state.left + diff;
                      if (res > 0) {
                          res = 0;
                      } else if (res < -100) {
                          res = -100;
                      }
                      this.setState({left: res, transition: ""});
                      this.startX = nowX;
                      if (diff) {
                          if (this.timer){
                              clearInterval(this.timer);
                          }
                          this.timer = setTimeout(() => {
                              this.setState({left: 0, transition: "left 170ms linear"});
                          }, 3000);
                      }
                      this.stopDefaultEvent(e);
                  }} style={{left: this.state.left, transition: this.state.transition}}>
                 {this.props.children}
             </div>
         </div>
        );
    }
}
export default SwipeAction;