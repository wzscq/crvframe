import { Button,Space } from "antd";
import {useCallback} from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
    FRAME_MESSAGE_TYPE,
    FORM_TYPE,
    CC_COLUMNS
} from '../../../utils/constant';
import {getOperationPreporcessFunc} from '../../../utils/functions';
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
                modelID:modelID,
                list:list
            };
        } else if(formType===FORM_TYPE.DETAIL){
            const list=getDetailRequestData(origin);
            return {
                modelID:modelID,
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
                console.log('MultiSelectForOptions:',errorField)
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
            console.log('operationData',operationData);
            //如果请求操作中传递了输入参数，将输入参数和表单数据合并在一起提交
            let input=operationData;
            if(operation?.input?.list?.length>0){
                const initRowData=operation.input.list[0];
                if(input?.list?.length>0){
                    input.list=input.list.map(row=>{
                        return {...row,...initRowData}
                    });
                }
            }

            if(operation.preprocessing){
                console.log('preprocessing',operation.preprocessing,JSON.stringify(input));
                const preporcessResult=getOperationPreporcessFunc(operation.preprocessing)(operation,input);
                if(preporcessResult){
                    if(preporcessResult.operation){
                        operation=preporcessResult.operation;
                    }
                    if(preporcessResult.input){
                        input=preporcessResult.input;
                    }
                }
                console.log('preprocessing result',preporcessResult);
            }

            //调用流的操作数据是通过input传递的
            input={...operation.input,...input};
            if(item.input){
                //这里的item是打开表单时在前一个页面操作中选择的数据或者前一个操作的输出
                //在批量更新时将选择的数据和输入的数据合并在一起提交
                input={...item.input,...input}
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
    },[item,update,updated,getOperationData,sendMessageToParent,dispatch,form.controls]);

    return (
        <>
            <div className="form-header-label">{label?getLocaleLabel(label):label}</div>
            <div className="form-header-operationbar">
                <Space>
                    {
                        operations.map((element,index)=>{
                            return (<Button key={index} type="primary" onClick={()=>doOperation(element)}>{getLocaleLabel(element.name)}</Button>);
                        })
                    }
                </Space>
            </div>
        </>
    )
}