/* eslint-disable no-new-func */
export const getManyToOneValueFunc=(optionLabel)=>{
    const funStr='"use strict";'+
                'return (function(record){ '+
                    'try {'+
                        optionLabel+
                    '} catch(e) {'+
                    '   console.error(e);'+
                    '   return undefined;'+
                    '}'+
                '})';
    return Function(funStr)();
};

export const base64EncodeUnicode=(str)=> {
    // Firstly, escape the string using encodeURIComponent to get the UTF-8 encoding of the characters, 
    // Secondly, we convert the percent encodings into raw bytes, and add it to btoa() function.
    const utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode('0x' + p1);
    });
  
    return btoa(utf8Bytes);
}

export function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}
  
export function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}

export function formatStringNumber(numStr,locale='en-US',minimumFractionDigits=0){
    return numStr?.length>0?parseFloat(numStr).toLocaleString(locale, {minimumFractionDigits: minimumFractionDigits,maximumFractionDigits: 20}):'';
}

export const getOperationPreporcessFunc=(preporcess)=>{
    const funStr='"use strict";'+
                'return (function(operation,input){ '+
                    'try {'+
                        preporcess+
                    '} catch(e) {'+
                    '   console.error(e);'+
                    '   return undefined;'+
                    '}'+
                '})';
    return Function(funStr)();
}