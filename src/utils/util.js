// libs
import React from 'react'
// components
import { message } from "@/components/message/utils";
import Msg from "@/components/icon/msg";

export const aionMessage = (msg) => {
    message({
        content: <div style={{ display: 'inline-block', textAlign: 'center' }}>
            <Msg width={24} style={{ verticalAlign: 'middle', marginRight: '6px' }}/>
            <div style={{
                height: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                lineHeight: '20px',
                display: 'inline-block',
                color: '#000',
                verticalAlign: 'middle'
            }}>
                {msg}
            </div>
        </div>,
        duration: 5000,
        style: {
            padding: '4px'
        }
    })
}



// copy value to copy board
export const copyInputValue = (targetValue) => {
    const input = document.createElement('input');
    input.setAttribute('value', targetValue);
    input.setAttribute('type', 'text');
    input.setAttribute('style', "visiblity:'none';display:'none';height:0");
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    aionMessage('copied');
    document.body.removeChild(input);
}
