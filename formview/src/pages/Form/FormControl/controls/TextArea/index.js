import { createSelector } from '@reduxjs/toolkit';
import {Input,Space,Tooltip } from 'antd';
import { useEffect,useRef,useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { modiData,removeErrorField } from '../../../../../redux/dataSlice';
import I18nLabel from '../../../../../component/I18nLabel';
//import './index.css';
const {TextArea} = Input;

const selectUpdatedValue=(data,dataPath,field)=>{
    let updatedNode=data.updated;
    
    for(let i=0;i<dataPath.length;++i){
        updatedNode=updatedNode[dataPath[i]];
        if(!updatedNode){
            return undefined;
        }
    }
    
    return updatedNode[field];
};

const selectValueError=(data,dataPath,field)=>{
    let errNode=data.errorField;
    for(let i=0;i<dataPath.length;++i){
        errNode=errNode[dataPath[i]];
        if(!errNode){
            return undefined;
        }
    }
    return errNode[field];
}

const makeSelector=()=>{
    return createSelector(
        selectUpdatedValue,
        selectValueError,
        (updatedValue,valueError)=>{
            return {updatedValue,valueError}
        });
}

export default function TextAreaControl({dataPath,control,field}){
    const dispatch=useDispatch();
    const inputRef = useRef(null);

    const selectValue = useMemo(makeSelector, [dataPath,control,field]);
    const {updatedValue,valueError}=useSelector(state=>selectValue(state.data,dataPath,field.field));

    const onChange=(e)=>{
        dispatch(modiData({
            dataPath:dataPath,
            field:field.field,
            updated:e.target.value,
            update:e.target.value}));
        
        if(valueError){
            dispatch(removeErrorField(field.field));
        }
    }

    useEffect(()=>{
        if(inputRef.current){
            inputRef.current.focus({
                cursor: 'end',
            });
        }
    },[valueError,inputRef]);

    //获取文本输入框的标签，如果form控件配置了label属性则直接使用，
    //如果控件没有配置label属性，则取字段配置的字段name
    const label=control.label?control.label:(field?field.name:"");
    
    let inputControl=(
        <TextArea  
            placeholder={control.placeholder?control.placeholder:""} 
            value={updatedValue} 
            allowClear
            rows={control.textRowCount}
            disabled={control.disabled} 
            onChange={onChange}
            ref={inputRef}
            status={valueError?'error':null}
            />
    );

    inputControl=valueError?(
        <Tooltip title={<I18nLabel label={valueError.message}/>}>
            {inputControl}
        </Tooltip>):inputControl

    return (
        <div>
            <Space size={2} direction="vertical" style={{width:'100%'}}>
                <div style={{width:'100%',textAlign:'left'}}>
                    {control.required?(<span style={{color:'red'}}>*</span>):null}
                    <I18nLabel label={label}/>
                </div>
                {inputControl}
            </Space>
        </div>
    );
}