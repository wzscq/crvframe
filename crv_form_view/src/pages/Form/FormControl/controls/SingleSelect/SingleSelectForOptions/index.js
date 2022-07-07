import { createSelector } from '@reduxjs/toolkit';
import {Select,Space,Tooltip } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { modiData,removeErrorField } from '../../../../../../redux/dataSlice';
import I18nLabel from '../../../../../../component/I18nLabel';

import './index.css';
import { useMemo } from 'react';

const { Option } = Select;

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
};

const makeSelector=()=>{
    return createSelector(
        selectUpdatedValue,
        selectValueError,
        (updatedValue,valueError)=>{
            return {updatedValue,valueError};
        }
    );
}

export default function SingleSelectForOptions({dataPath,control,field}){
    const dispatch=useDispatch();

    const selectValue=useMemo(makeSelector,[dataPath,control,field]);
    const {updatedValue,valueError}=useSelector(state=>selectValue(state.data,dataPath,field.field));
    
    const onChange=(value)=>{
        if(value===undefined){
            //这里主要是考虑值被删除的时候，将值置为空，
            //否则删除后由于modifiedValue为undefind，将显示originValue，无法实现删除值的逻辑
            value=null;
        }
        
        dispatch(modiData({
            dataPath:dataPath,
            field:field.field,
            updated:value,
            update:value}));
        
        if(valueError){
            const errFieldPath=dataPath.join('.')+'.'+field.field;
            dispatch(removeErrorField(errFieldPath));
        }
    }

    //获取文本输入框的标签，如果form控件配置了label属性则直接使用，
    //如果控件没有配置label属性，则取字段配置的字段name
    const label=control.label?control.label:(field?field.name:"");

    const options=control.options.map((item,index)=>
    (<Option key={index} value={item.value}>
        <I18nLabel label={item.label}/>
    </Option>));
    
    let selectControl= (<Select  
        style={{width:'100%'}}  
        placeholder={control.placeholder?<I18nLabel label={control.placeholder}/>:""} 
        value={updatedValue} 
        allowClear
        disabled={control.disabled} 
        onChange={onChange}
        status={valueError?'error':null}
        >
        {options}
    </Select>);

    selectControl=valueError?(
        <Tooltip title={<I18nLabel label={valueError.message}/>}>
            {selectControl}
        </Tooltip>):selectControl;
    
    if(control.inline){
        return selectControl;
    }
    
    //(modifiedValue!==undefined)?'control-text-modified':
    const className=valueError?'control-select-error':'control-select-normal';

    return (
        <div className={className}>
            <Space size={2} direction="vertical" style={{width:'100%'}}>
                <div style={{width:'100%',textAlign:'left'}}>
                    {control.required?(<span style={{color:'red'}}>*</span>):null}
                    <I18nLabel label={label}/>
                </div>
                {selectControl}
            </Space>
        </div>
    )
}