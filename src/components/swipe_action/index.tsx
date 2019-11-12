import React, { Component } from "react";
import "./index.less";

class SwipeAction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            left: 0,
        };
        this.startX = 0;
        this.timer = null
    }
    render() {
        return (
         <div className="swiper-action">
             <div className="wsiper-action-content" onTouchStart={(e) => {
                 this.startX = e.touches[0].clientX;
                 // console.log("start touch:", e.target, this.startX);
             }}
                  onTouchMove={(e) => {
                      const nowX = e.touches[0].clientX;
                      const diff = nowX - this.startX;
                      let res = this.state.left + diff;
                      // console.log('calcute:', e.touches[0].clientX, nowX, this.startX, diff, res);
                      if (res > 0) {
                          res = 0;
                      } else if (res < -100) {
                          res = -100;
                      }
                      this.setState({left: res});
                      if(this.timer) clearInterval(this.timer);
                      this.timer = setTimeout(() => {
                          this.setState({left: 0});
                      }, 3000);
                      // console.log("start move:", e.target, touch.clientX, touch.clientY);
                  }} style={{left: this.state.left}}>
                 {this.props.children}
             </div>
         </div>
        );
    }
}
export default SwipeAction;
