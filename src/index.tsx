/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-nested-ternary */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
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

ReactDOM.render(
  <App />,
  document.getElementById('root'),
);
