import { createSelector } from '@reduxjs/toolkit';
import {Input,Space,Tooltip } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {useRef,useEffect, useMemo} from 'react';

import { modiData,removeErrorField } from '../../../../../redux/dataSlice';
import {encodePassword} from '../../../../../utils/passwordEncoder';
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

export default function Password({dataPath,control,field}){
    const dispatch=useDispatch();
    const inputRef = useRef(null);

    const selectValue=useMemo(makeSelector,[dataPath,control,field]);
    const {updatedValue,valueError}=useSelector(state=>selectValue(state.data,dataPath,field.field));

    const onChange=(e)=>{
        let password=e.target.value;
        if(password){
            password=encodePassword(password);
        }
        
        dispatch(modiData({
            dataPath:dataPath,
            field:field.field,
            updated:e.target.value,
            update:password}));
        
        if(valueError){
            const errFieldPath=dataPath.join('.')+'.'+field.field;
            dispatch(removeErrorField(errFieldPath));
        }
    }

    //获取文本输入框的标签，如果form控件配置了label属性则直接使用，
    //如果控件没有配置label属性，则取字段配置的字段name
    const label=control.label?control.label:(field?field.name:"");

    let passwordControl=(
        <Input.Password  
            value={updatedValue} 
            disabled={control.disabled} 
            onChange={onChange}
            status={valueError?'error':null}
            ref={inputRef}
        />
    );

    useEffect(()=>{
        if(inputRef.current){
            inputRef.current.focus({
                cursor: 'end',
            });
        }
    },[valueError,inputRef]);
    
    passwordControl=valueError?(
        <Tooltip title={<I18nLabel label={valueError.message}/>}>
            {passwordControl}
        </Tooltip>):passwordControl

    //modifiedValue?'control-password-modified':
    const className='control-password-normal';

    return (
        <div className={className}>
            <Space size={2} direction="vertical" style={{width:'100%'}}>
                <div style={{width:'100%',textAlign:'left'}}>
                    {control.required?(<span style={{color:'red'}}>*</span>):null}
                    <I18nLabel label={label}/>
                </div>
                {passwordControl}
            </Space>
        </div>
    )
}