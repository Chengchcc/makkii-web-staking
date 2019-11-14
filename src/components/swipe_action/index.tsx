import React, { Component } from "react";
import "./index.less";


let id = 0;

class SwipeAction extends Component<any, {
    left: number,
    transition: string
}> {

    startX: number
    
    startY: number

    timer: NodeJS.Timeout;

    classId: string

    constructor(props) {
        super(props);
        this.state = {
            left: 0,
            transition: ""
        };
        this.classId = `swipe-${id}`;
        id+=1;
    }

    componentDidMount() {
        const element = document.getElementById(this.classId);
        element.addEventListener('touchstart', this.onTouchStart);
        element.addEventListener('touchmove', this.onTouchMove);
    }


    componentWillUnmount(): void {
        if (this.timer) clearTimeout(this.timer);
        const element = document.getElementById(this.classId);
        element.removeEventListener('touchstart', this.onTouchStart);
        element.removeEventListener('touchmove', this.onTouchMove);
    }

    onTouchStart = e=>{
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
    }

    onTouchMove = e=>{
        const nowX = e.touches[0].clientX;
        const nowY = e.touches[0].clientY;

        const diffX = nowX - this.startX;
        const diffY = nowY - this.startY;

        this.startX = nowX;
        this.startY = nowY;
        if (Math.abs(diffY) < 5 && Math.abs(diffY) < Math.abs(diffX) && Math.abs(diffX)> 10) {
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
    }

    render() {
        const { left, transition } = this.state;
        return (
            <div className="swiper-action">
                <div className="wsiper-action-content"
                    id = {this.classId}
                    style={{ left, transition }}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}
export default SwipeAction;
