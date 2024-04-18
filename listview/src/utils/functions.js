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

export function formatStringNumber(numStr,locale='en-US',minimumFractionDigits=0){
    return numStr?.length>0?parseFloat(numStr).toLocaleString(locale, {minimumFractionDigits: minimumFractionDigits,maximumFractionDigits: 20}):'';
}

export const getOperationPreporcessFunc=(preporcess)=>{
    const funStr='"use strict";'+
                'return (function(operation,record,moment){ '+
                    'try {'+
                        preporcess+
                    '} catch(e) {'+
                    '   console.error(e);'+
                    '   return undefined;'+
                    '}'+
                '})';
    return Function(funStr)();
}

export const getListOperationPreporcessFunc=(preporcess)=>{
    const funStr='"use strict";'+
                'return (function(operation,input,moment){ '+
                    'try {'+
                        preporcess+
                    '} catch(e) {'+
                    '   console.error(e);'+
                    '   return undefined;'+
                    '}'+
                '})';
    return Function(funStr)();
}

export const getRowButtonDisabledFunc=(disabled)=>{
    const funStr='"use strict";'+
                'return (function(record){ '+
                    'try {'+
                        disabled+
                    '} catch(e) {'+
                    '   console.error(e);'+
                    '   return undefined;'+
                    '}'+
                '})';
    return Function(funStr)();
}