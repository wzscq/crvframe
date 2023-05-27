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

export function formatStringNumber(numStr,locale='en-US'){
    return numStr?.length>0?parseFloat(numStr).toLocaleString(locale, {minimumFractionDigits: 0,maximumFractionDigits: 20}):'';
}