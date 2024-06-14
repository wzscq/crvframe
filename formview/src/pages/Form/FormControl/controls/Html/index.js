import { createSelector } from '@reduxjs/toolkit';
import {Space} from 'antd';
import { useEffect,useMemo,useRef } from 'react';
import { useSelector } from 'react-redux';

import I18nLabel from '../../../../../component/I18nLabel';

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
    const errFieldPath=dataPath.join('.')+'.'+field;
    return data.errorField[errFieldPath];
}

const makeSelector=()=>{
    return createSelector(
        selectUpdatedValue,
        selectValueError,
        (updatedValue,valueError)=>{
        return {updatedValue,valueError}
    });
}

export default function Html({dataPath,control,field}){
    const htmlRef = useRef(null);
        
    const selectValue=useMemo(makeSelector,[dataPath,control,field]);
    const {updatedValue}=useSelector(state=>selectValue(state.data,dataPath,field.field));

    useEffect(()=>{
        if(htmlRef.current){
            htmlRef.current.innerHTML=updatedValue;
        }
    },[htmlRef,updatedValue]);

    //获取文本输入框的标签，如果form控件配置了label属性则直接使用，
    //如果控件没有配置label属性，则取字段配置的字段name
    const label=control.label?control.label:(field?field.name:"");
    
    let inputControl=(<div ref={htmlRef}/>)

    if(control.inline){
        return inputControl;
    }

    const className='control-html';
    return (
        <div className={className}>
            <Space size={2} direction="vertical" style={{width:'100%'}}>
                <div style={{width:'100%',textAlign:'left'}}>
                    {control.required&&control.disabled!==true?(<span style={{color:'red'}}>*</span>):null}
                    <I18nLabel label={label}/>
                </div>
                {inputControl}
            </Space>
        </div>
    );
}