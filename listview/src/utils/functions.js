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