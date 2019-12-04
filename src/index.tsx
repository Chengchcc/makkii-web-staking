/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-nested-ternary */
import 'makkii-webview-bridge';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import store, { createAction } from '@reducers/store';
import { wsSend } from '@utils/websocket';
import history from '@utils/history';
import { I18nextProvider } from "react-i18next";
import i18n from "@utils/i18n";
import App from './app';
import './global.less'

if (!Date.prototype.Format) {
    // eslint-disable-next-line no-extend-native
    Date.prototype.Format = function Format(fmt, radix = 12) {
        const ext = radix === 12 && fmt.indexOf('h') >= 0;
        const o = {
            'M+': this.getMonth() + 1, // month
            'd+': this.getDate(), // day
            'h+': radix === 12 ? (this.getHours() % 12 === 0 ? 12 : this.getHours() % 12) : this.getHours(), // hour
            'm+': this.getMinutes(), // minute
            's+': this.getSeconds(), // seconds
            'q+': Math.floor((this.getMonth() + 3) / 3), // quarter
            S: this.getMilliseconds(), // milliseconds
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, `${this.getFullYear()}`.substring(4 - RegExp.$1.length));
        for (const k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : `00${o[k]}`.substring(`${o[k]}`.length));
            }
        }
        if (ext) {
            fmt = this.getHours() >= 12 ? `${fmt} PM` : `${fmt} AM`;
        }
        return fmt;
    };
}

const { makkii } = window;
if (makkii.isconnect()) {
    makkii.getCurrentAccount().then(r => {
        store.dispatch(createAction('account/update')({
            address: r
        }))
        wsSend({ method: 'eth_getBalance', params: [r] })
        wsSend({ method: 'delegations', params: [r, 0, 10] })
        wsSend({ method: 'transactions', params: [r, 0, 10] })
        wsSend({ method: 'pools', params: [] })
        wsSend({ method: 'undelegations', params: [r, 0, 10] })
        history.push('/home')
    })
} else {
    const { address: r } = store.getState().account;
    if (r) {
        wsSend({ method: 'eth_getBalance', params: [r] })
        wsSend({ method: 'delegations', params: [r, 0, 10] })
        wsSend({ method: 'transactions', params: [r, 0, 10] })
        wsSend({ method: 'pools', params: [] })
        wsSend({ method: 'undelegations', params: [r, 0, 10] })
        history.push('/home')
    }
}



ReactDOM.render(
    <I18nextProvider i18n={i18n}>
        <App />
    </I18nextProvider>,
    document.getElementById('root'),
);
