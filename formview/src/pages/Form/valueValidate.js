import {FIELD_TYPE} from  '../../utils/constant';

const validateField=(dataPath,control,rowValue,errorField)=>{
    const {required,field,validation}=control;
    if(required){
        if(rowValue[field]){
            if(control.fieldType){
                if(control.fieldType===FIELD_TYPE.MANY2MANY||
                    control.fieldType===FIELD_TYPE.ONE2MANY||
                    control.fieldType===FIELD_TYPE.MANY2ONE||
                    control.fieldType===FIELD_TYPE.FILE){
                    if(!(rowValue[field].list&&
                        (rowValue[field].list.length>0||
                        Object.keys(rowValue[field].list).length>0))){
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
            }
        }
    }
}

const subValueValidate=(dataPath,controls,values,errorField)=>{
    controls.forEach(control => {
        if(control.field){
            for(const rowKey in values){
                const row=values[rowKey];
                validateField(dataPath+'.'+rowKey,control,row,errorField);
                if(control.controls){
                    subValueValidate(dataPath+'.'+rowKey+'.list',control.controls,row[control.field]?.list,errorField);
                }
            }
        }
    });
}

const valueValidate=(controls,values,errorField)=>{
    controls.forEach(control => {
        console.log('valueValidate control:',control);
        if(control.field){
            for(const rowKey in values){
                const row=values[rowKey];
                validateField(rowKey,control,row,errorField);
                if(control.controls){
                    subValueValidate(rowKey+'.'+control.field+'.list',control.controls,row[control.field]?.list,errorField);
                }
            }
        }
    });
}

export {
    valueValidate
}