import { Button,Space } from "antd";
import {useCallback} from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
    FRAME_MESSAGE_TYPE,
    FORM_TYPE,
    CC_COLUMNS
} from '../../../utils/constant';
import {setErrorField} from '../../../redux/dataSlice';
import {valueValidate} from '../valueValidate';
import useI18n from '../../../hook/useI18n';

import './index.css';

export default function FormHeader({label,operations,form,sendMessageToParent}){
    const {getLocaleLabel}=useI18n();
    const dispatch=useDispatch();
    const {updated,origin,update}=useSelector(state=>{
        return state.data
    });
    const {item}=useSelector(state=>state.frame);
    const {modelID,formType}=useParams();
    
    const getOperationData=useCallback((update)=>{
        const getUpdateRequestData=(controls,data)=>{
            const list=[];
            for(const rowKey in data){
                const rowData={...data[rowKey]};
                list.push(rowData);
                for(const controlIdx in controls){
                    let {controls:subControls,field,relatedModelID,fieldType,associationModelID,relatedField}=controls[controlIdx];
                    if(subControls){
                        if(rowData[field]&&rowData[field].list){
                            const fieldList=rowData[field].list;
                            rowData[field]={
                                ...rowData[field],
                                modelID:relatedModelID,
                                fieldType:fieldType,
                                associationModelID:associationModelID,
                                relatedField:relatedField,
                                list:{}};
                            rowData[field].list=getUpdateRequestData(subControls,fieldList);
                        }
                    }
                }
            }
            return list;
        };
    
        const getDetailRequestData=(data)=>{
            const list=[];
            for(const rowKey in data){
                const rowData=data[rowKey];
                list.push({[
                    [CC_COLUMNS.CC_ID]]:rowData[CC_COLUMNS.CC_ID],
                    [CC_COLUMNS.CC_VERSION]:rowData[CC_COLUMNS.CC_VERSION]
                });
            }
            return list;
        }
        
        
        if(formType===FORM_TYPE.CREATE||
           formType===FORM_TYPE.EDIT||
           formType===FORM_TYPE.UPDATE
        ){
            let list=getUpdateRequestData(form.controls,update);
            //编辑状态下，如果用户没有录入任何数据，list是空的，这时因为数据都没有做修改，因此将返回和详情页面相同的数据
            /*if(formType===FORM_TYPE.EDIT&&list.length===0){
                list=getDetailRequestData(origin);
            }*/
            return {
                modelid:modelID,
                list:list
            };
        } else if(formType===FORM_TYPE.DETAIL){
            const list=getDetailRequestData(origin);
            return {
                modelid:modelID,
                list:list
            };
        }
        return {}

    },[formType,origin,modelID,form.controls]);

    
    const doOperation=useCallback((operation)=>{
        const validateData=(updated)=>{
            let errorField={errorField:{}};
            valueValidate(form.controls,updated,errorField);  
            errorField=errorField.errorField;
            const errFieldCount=Object.keys(errorField).length;
            if(errFieldCount>0){
                dispatch(setErrorField(errorField));
            }
            return (errFieldCount<=0);
        };
        
        if(operation){
            if(operation.validateFormData!==false){
                //验证表单数据合法性
                if(!validateData(updated)){
                    console.warn('验证表单数据合法性,存在错误!');
                    return;
                }
            }
            const operationData=getOperationData(update);
            let input={...operation.input,...operationData};
            if(item.input&&item.input!=={}){
                if(formType===FORM_TYPE.UPDATE){
                    input={...item.input,...input}
                } else {
                    //以下处理时为了配合流的执行
                    if(item.input.flowInstanceID){
                        input.flowInstanceID=item.input.flowInstanceID;
                    }

                    if(item.input.stage){
                        input.stage=item.input.stage;
                    }
                }
            }
            const message={
                type:FRAME_MESSAGE_TYPE.DO_OPERATION,
                data:{
                    operationItem:{
                        ...operation,
                        input:input
                    }
                }
            };
            sendMessageToParent(message);
        }
    },[item,formType,update,updated,getOperationData,sendMessageToParent,dispatch,form.controls]);

    return (
        <>
            <div className="form-header-label">{label?getLocaleLabel(label):label}</div>
            <div className="form-header-operationbar">
                <Space>
                    {
                        operations.map(element=>{
                            return (<Button type="primary" onClick={()=>doOperation(element)}>{getLocaleLabel(element.name)}</Button>);
                        })
                    }
                </Space>
            </div>
        </>
    )
}