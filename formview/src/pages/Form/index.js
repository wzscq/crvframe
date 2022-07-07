import { useEffect } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { useParams } from 'react-router-dom';

import useFrame from '../../hook/useFrame';
import { 
    createGetFormConfMessage,
    createQueryDataMessage } from '../../utils/normalOperations';
import {createRow} from '../../redux/dataSlice';
import { FORM_TYPE } from '../../utils/constant';
import FormView from './FormView';
import PageLoading from './PageLoading';

export default function Form(){
    const sendMessageToParent=useFrame();
    const dispatch=useDispatch();
    const {origin,item}=useSelector(state=>state.frame);
    const {modelID,formID,formType}=useParams();
    const dataLoaded=useSelector(state=>state.data.loaded);
    const {loaded,forms,fields} = useSelector(state=>state.definition);

    //加载配置
    useEffect(()=>{
        if(origin&&item){
            if(loaded===false){
                const frameParams={
                    frameType:item.frameType,
                    frameID:item.params.key,
                    origin:origin};
                sendMessageToParent(createGetFormConfMessage(frameParams,modelID,formID));
            }
        }
    },[loaded,modelID,formID,origin,item,formType,sendMessageToParent]);

    const getControlFields=(control)=>{
        if(control.fields){
            return control.fields;
        }

        if(control.controls){
            return control.controls;
        }

        return [];
    }

    //加载数据
    useEffect(()=>{
        const getFormFields=(form,modelFields)=>{
            const fields=[{field:'id'},{field:'version'}];
            if(form&&form.controls){
                form.controls.forEach(element=>{
                    if(element.field !== 'id'&&element.field !== 'version'){
                        const modelField=modelFields.find(item=>item.field===element.field);
                        if(modelField){
                            if(modelField.fieldType){
                                fields.push({
                                    field:element.field,
                                    fieldType:modelField.fieldType,
                                    relatedModelID:modelField.relatedModelID,
                                    relatedField:modelField.relatedField,
                                    associationModelID:modelField.associationModelID,
                                    fields:getControlFields(element)
                                });
                            } else {
                                fields.push({field:element.field});
                            }
                        }
                    }
                });
            }
            return fields;
        }
        
        if(loaded===true){
            if(dataLoaded===false&&(formType===FORM_TYPE.EDIT||formType===FORM_TYPE.DETAIL)){
            //目前的表单页面仅支持单条数据的编辑和展示
                const dataID=item?.input?.selectedRowKeys[0];
                if(dataID){
                    const frameParams={
                        frameType:item.frameType,
                        frameID:item.params.key,
                        origin:origin
                    };
                    const queryParams={
                        modelID:item.input.modelID,
                        filter:{id:dataID},
                        fields:getFormFields(forms[0],fields),
                        pagination:{current:1,pageSize:1}
                    };
                    sendMessageToParent(createQueryDataMessage(frameParams,queryParams));
                }
            } else if(formType===FORM_TYPE.CREATE||formType===FORM_TYPE.UPDATE){
                //FORM_TYPE.CREATE
                dispatch(createRow([]));
            }
        }
    },[loaded,dataLoaded,forms,fields,formType,item,origin,dispatch,sendMessageToParent]);
    const showForm=loaded===true&&(dataLoaded===true||formType===FORM_TYPE.CREATE||formType===FORM_TYPE.UPDATE);
    return (
        showForm?<FormView fromTitle={item.params.title} formType={formType} sendMessageToParent={sendMessageToParent}/>:<PageLoading/>
    );
}