/* eslint-disable camelcase */
import store, { createAction } from '@reducers/store';
import {alert} from '@components/modal';

export const formatAddress = address => {
    return `${address.slice(0, 10)  }...${  address.slice(-10)}`
}

export const formatTxHash = txhash => {
    return `${txhash.slice(0, 15)  }...${  txhash.slice(-15)}`
}


export function hexCharCodeToStr(hexCharCodeStr) {
    const trimed_Str = hexCharCodeStr.trim()
    const raw_str =
        trimed_Str.substr(0, 2).toLowerCase() === '0x'
            ? trimed_Str.substr(2) : trimed_Str
    const len = raw_str.length
    if (len % 2 !== 0) {
        console.log('Illegal Format ASCII Code!')
        return ''
    }
    let cur_char_Code
    const result_str = []
    for (let i = 0; i < len; i += 2) {
        cur_char_Code = parseInt(raw_str.substr(i, 2), 16) // ASCII Code Value
        result_str.push(String.fromCharCode(cur_char_Code))
    }
    return result_str.join('')
}

export const validateAmount = amount => {
    const reg = /^[0-9]?((\.[0-9]+)|([0-9]+(\.[0-9]*)?))$/;
    return reg.test(amount)
}


// TODO mock

export const genPoolName = ()=> {
    const Template = '0123456789abcdefghjklmnopqrstuvwxyz';
    let str = '';
    for(let i =0;i<4;i+=1){
        str += Template.charAt(parseInt(`${Math.random()*26}`,10))
    }
    return str;
}


export const handleSwitchAccount = () => {
    const { makkii } = window;
    if (makkii.isconnect()) {
        makkii.switchAccount().then(r => {
            console.log('handleSwitchAccount', r);
            store.dispatch(createAction('account/update')({ address: r }))
        }).catch(err => {
            console.log('switch account error=>', err);
        })
    } else {
        console.log('not in makkii env')
        alert({
            title:'error',
            message: 'Please open by Makkii',
            actions: [{
                title: 'Ok',
                onPress: ()=>{
                    
                }
            },
            {
                title: 'Cancel'
            }
        ]
        })
    }

}