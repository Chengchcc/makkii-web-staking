import React, { Component } from 'react'
import './index.scss'
class Message extends Component {
    constructor(props) {
        super(props)
        this.state = {
            animationClass: ''
        }
        setTimeout(() => {
            this.setState({
                animationClass: ''
            })
        }, parseFloat(props.duration))
    }
    componentDidMount() {
        setTimeout(() => {
            this.setState({
                animationClass: 'message-animation'
            })
        }, 0)
    }
    render() {
        return (
            <div className={'common-message ' + this.state.animationClass} style={this.props.style}>
                {this.props.children}
            </div>
        )
    }
}
export default Message
