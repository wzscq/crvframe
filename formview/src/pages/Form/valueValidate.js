import {FIELD_TYPE} from  '../../utils/constant';

const validateField=(dataPath,control,rowValue,errorField)=>{
    const {required,field,validation}=control;
    console.log('validation',validation);    
    if(required){
        console.log('validateField',dataPath,field,rowValue);
        if(rowValue[field]){
            if(rowValue[field].fieldType){
                if(rowValue[field].fieldType===FIELD_TYPE.MANY2MANY||
                   rowValue[field].fieldType===FIELD_TYPE.ONE2MANY||
                   rowValue[field].fieldType===FIELD_TYPE.MANY2ONE||
                   rowValue[field].fieldType===FIELD_TYPE.FILE){
                    if(!(rowValue[field].list&&rowValue[field].list.length>0)){
                        errorField.errorField[dataPath+'.'+field]={message:{key:'page.crvformview.requiredField',default:'必填字段！'}};
                        return; 
                    }
                }
            } else {
                if(rowValue[field].length<=0){
                    errorField.errorField[dataPath+'.'+field]={message:{key:'page.crvformview.requiredField',default:'必填字段！'}};
                    return;
                }
            }
        } else {
            errorField.errorField[dataPath+'.'+field]={message:{key:'page.crvformview.requiredField',default:'必填字段！'}};
            return;
        }
    }

    if(validation){
        const {func,message}=validation;
        if(func&&message){
            const funStr='"use strict";'+
                'return (function(record){ '+
                    'try {'+
                        func+
                    '} catch(e) {'+
                    '   console.error(e);'+
                    '   return false;'+
                    '}'+
                '})';
            const validateFunc=Function(funStr)();
            if(!validateFunc(rowValue)){
                errorField.errorField[dataPath+'.'+field]={message:message};
                console.log(errorField);
            }
        }
    }
}

const subValueValidate=(dataPath,controls,values,errorField)=>{
    controls.forEach(control => {
        if(control.field){
            for(const rowKey in values){
                const row=values[rowKey];
                if(control.controls){
                    subValueValidate(dataPath+'.'+rowKey+'.list',control.controls,row[control.field].list,errorField);
                } else {
                    validateField(dataPath+'.'+rowKey,control,row,errorField);
                }
            }
        }
    });
}

const valueValidate=(controls,values,errorField)=>{
    controls.forEach(control => {
        if(control.field){
            for(const rowKey in values){
                const row=values[rowKey];
                if(control.controls){
                    subValueValidate(rowKey+'.list',control.controls,row[control.field]?.list,errorField);
                } else {
                    validateField(rowKey,control,row,errorField);
                }
            }
        }
    });
}

export {
    valueValidate
}