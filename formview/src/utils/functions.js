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