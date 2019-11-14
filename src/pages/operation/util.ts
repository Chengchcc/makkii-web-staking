import React from 'react';
import history from '@utils/history';


export const commonGoback = ()=>{
    history.go(-1)
}

export const useListenKeyboard = () => {
    const [enable, setEnable] = React.useState(false);
    const resize = ()=> {
        console.log('resize')
        const clientHeight = document.documentElement.clientHeight || document.body.clientHeight
        if (this.state.clientHeight > clientHeight){
            setEnable(true)
        }else{
            setEnable(false)
        }
    }
    React.useEffect(()=>{
        window.addEventListener('resize', resize);
        return ()=>{
            window.removeEventListener('resize', resize);
        }
    })
    return enable
}