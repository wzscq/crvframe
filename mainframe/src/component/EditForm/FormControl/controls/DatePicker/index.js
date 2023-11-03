import { createSelector } from '@reduxjs/toolkit';
import {DatePicker,Space,Tooltip } from 'antd';
import { useEffect,useMemo,useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import I18nLabel from '../../../../I18nLabel';
import { modiData,removeErrorField } from '../../../../../redux/dataSlice';
import { FORM_LABEL_POS } from '../../../../../operation/constant';
//import './index.css';

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

export default function DatePickerControl({dataPath,control,field,labelPos}){
    const dispatch=useDispatch();
    const inputRef = useRef(null);
    
    const selectValue=useMemo(makeSelector,[dataPath,control,field]);
    const {updatedValue,valueError}=useSelector(state=>selectValue(state.data,dataPath,field.field));

    const onChange=(date,dateString)=>{
        const value=date?dateString:null;

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

    useEffect(()=>{
        if(inputRef.current){
            inputRef.current.focus({
                cursor: 'end',
            });
        }
    },[valueError,inputRef]);

    //设置默认值
    useEffect(()=>{
        if(updatedValue===undefined&&control.defaultValue!==undefined){
            const funStr='"use strict";'+
                     'return (function(dayjs){ '+
                        'try {'+
                           control.defaultValue+
                        '} catch(e) {'+
                        '   console.error(e);'+
                        '   return undefined;'+
                        '}'+
                     '})';
            const defaultValue=Function(funStr)()(dayjs);

            console.log('defaultValue:',defaultValue);

            dispatch(modiData({
                dataPath:dataPath,
                field:field.field,
                updated:defaultValue,
                update:defaultValue}));
        }
    },[updatedValue,dispatch,dataPath,field,control]);

    //获取文本输入框的标签，如果form控件配置了label属性则直接使用，
    //如果控件没有配置label属性，则取字段配置的字段name
    const label=control.label?control.label:(field?field.name:"");
    let value=updatedValue;
    if(value&&value.length>0){
        value=dayjs(value);
    }
    
    let datePickerControl=(
        <DatePicker  
            size='small'
            value={value} 
            disabled={control.disabled} 
            onChange={onChange}
            ref={inputRef}
            showTime={control.showTime}
            status={valueError?'error':null}
            />
    );

    datePickerControl=valueError?(
        <Tooltip title={<I18nLabel label={valueError.message}/>}>
            {datePickerControl}
        </Tooltip>):datePickerControl;

    //(modifiedValue!==undefined)?'control-text-modified':
    const className=valueError?'control-text-error':'control-text-normal';

    return (
        <div className={className}>
            <Space size={labelPos===FORM_LABEL_POS.LEFT?5:2} direction={labelPos===FORM_LABEL_POS.LEFT?"horizontal":"vertical"} style={{width:'100%'}}>
                <div style={{width:'100%',textAlign:'left'}}>
                    {control.required?(<span style={{color:'red'}}>*</span>):null}
                    <I18nLabel label={label}/>
                </div>
                {datePickerControl}
            </Space>
        </div>
    );
}