import {FIELD_TYPE} from  '../../utils/constant';

const validateField=(dataPath,control,rowValue,errorField)=>{
    const {required,field}=control;
    
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
                    }
                }
            } else {
                if(rowValue[field].length<=0){
                    errorField.errorField[dataPath+'.'+field]={message:{key:'page.crvformview.requiredField',default:'必填字段！'}};
                }
            }
        } else {
            errorField.errorField[dataPath+'.'+field]={message:{key:'page.crvformview.requiredField',default:'必填字段！'}};
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
                    subValueValidate(rowKey+'.list',control.controls,row[control.field].list,errorField);
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