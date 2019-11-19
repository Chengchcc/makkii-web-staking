import React from 'react'
import ReactDOM from 'react-dom'
import Message from './index'

let container = null
export function message(config) {
    // most outer container,
    if (!container) {
        container = document.createElement('div')
        container.setAttribute('class', 'message-container')
        container.style.width = '100%'
        container.style.position = 'fixed'
        container.style.top = '0'
        container.style.left = '0'
        container.style.height = '0'
        container.style.overflow = 'visible'
        container.style.zIndex = '1010'
        document.body.appendChild(container)
    }
    // most 3 Message exist on the same time
    if (document.querySelectorAll('.message-container>.message-item').length >= 3) return
    // container add msg component directly
    const msgItem = document.createElement('div')
    msgItem.style.width = '100%'
    msgItem.style.marginBottom = '14px'
    msgItem.style.position = 'relative'
    msgItem.style.pointerEvents = 'none'
    msgItem.setAttribute('class', 'message-item')
    container.appendChild(msgItem)
    const msg = <Message style={config.style} duration={config.duration}>{config.content}</Message>
    ReactDOM.render(msg, msgItem, () => {
    })
    setTimeout(() => {
        // unMount Message and it's direct container
        ReactDOM.unmountComponentAtNode(msgItem)
        container.removeChild(msgItem)
    }, parseFloat(config.duration) + 300)
}
