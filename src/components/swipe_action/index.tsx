import React, { Component } from "react";
import "./index.less";

class SwipeAction extends Component<any, {
    left: number,
    transition: string
}> {

    startX: number
    
    startY: number

    timer: NodeJS.Timeout;


    constructor(props) {
        super(props);
        this.state = {
            left: 0,
            transition: ""
        };

    }


    componentWillUnmount(): void {
        if (this.timer) clearTimeout(this.timer);
    }



    render() {
        const { left, transition } = this.state;
        return (
            <div className="swiper-action">
                <div className="wsiper-action-content"
                    onTouchStart={(e) => {
                        e.preventDefault();
                        this.startX = e.touches[0].clientX;
                        this.startY = e.touches[0].clientY;
                    }}
                    onTouchMove={(e) => {
                        e.preventDefault();
                        const nowX = e.touches[0].clientX;
                        const nowY = e.touches[0].clientY;

                        const diffX = nowX - this.startX;
                        const diffY = nowY - this.startY;

                        this.startX = nowX;
                        this.startY = nowY;
                        if (Math.abs(diffY) < 5 && Math.abs(diffY) < Math.abs(diffX)) {
                            if (diffX < 0) {
                                this.setState({ left: -100 });
                            } else if (diffX > 0) {
                                this.setState({ left: 0 });
                            }
                            if (diffX) {
                                if (this.timer) {
                                    clearInterval(this.timer);
                                }
                                this.timer = setTimeout(() => {
                                    this.setState({ left: 0 });
                                }, 3000);
                            }
                        }
                    }}
                    style={{ left, transition }}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}
export default SwipeAction;
