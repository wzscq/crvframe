import { createSelector } from '@reduxjs/toolkit';
import {Select,Space,Tooltip } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import {
    CC_COLUMNS,
    SAVE_TYPE
} from '../../../../../../utils/constant';
import { modiData,removeErrorField } from '../../../../../../redux/dataSlice';
import I18nLabel from '../../../../../../component/I18nLabel';
import DisabledControl from '../../DisabledControl';

import './index.css';
import { useMemo } from 'react';

const { Option } = Select;

const selectOriginValue=(data,dataPath,field)=>{
    let originNode=data.origin;
    for(let i=0;i<dataPath.length;++i){
        originNode=originNode[dataPath[i]];
        if(!originNode){
            return undefined;
        }
    }
    return originNode[field];
};

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
    console.log('selectValueError:',data,dataPath,field);
    const errFieldPath=dataPath.join('.')+'.'+field;
    console.log('selectValueError:',data,dataPath,field,errFieldPath);
    return data.errorField[errFieldPath];
};

const makeSelector=()=>{
    return createSelector(
        selectOriginValue,
        selectUpdatedValue,
        selectValueError,
        (originValue,updatedValue,valueError)=>{
            return {originValue,updatedValue,valueError};
        }
    );
}

export default function MultiSelectForOptions({dataPath,control,field}){
    const dispatch=useDispatch();

    const selectValue=useMemo(makeSelector,[dataPath,control,field]);
    const {originValue,updatedValue,valueError}=useSelector(state=>selectValue(state.data,dataPath,field.field));

    const onChange=(value,option)=>{
        const saveType={};
        saveType[CC_COLUMNS.CC_SAVE_TYPE]=SAVE_TYPE.CREATE;
        const addList=value.map(key=>{
            const originItem=originValue?originValue.list.find(item=>item.id===key):null;
            if(originItem){
                return {id:key};
            } else {
                return {id:key,...saveType};
            }
        });

        saveType[CC_COLUMNS.CC_SAVE_TYPE]=SAVE_TYPE.DELETE;
        const delList=originValue?originValue.list.map(item=>{
            const newItem=addList.find(element=>element.id===item.id);
            if(newItem){
                return {id:item.id};
            } else {
                return {id:item.id,...saveType};
            }
        }):[];

        const list = addList.concat(delList).filter(item=>item[CC_COLUMNS.CC_SAVE_TYPE]);
    
        dispatch(modiData({
            dataPath:dataPath,
            field:field.field,
            updated:value.length>0?{
                modelID:field.relatedModelID,
                fieldType:field.fieldType,
                associationModelID:field.associationModelID,
                list:value.map(key=>({id:key}))
            }:undefined,
            update:{
                modelID:field.relatedModelID,
                fieldType:field.fieldType,
                associationModelID:field.associationModelID,
                list:list
            }}));
        
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

    const getValueLabel=(value)=>{
        if(!value){
            return '';
        }

        if(!Array.isArray(value)){
            return '';
        }

        if(value.length===0){
            return '';
        }

        const itemLabels=[];
        value.forEach(item=>{
            const option=control.options.find(option=>option.value===item.id);
            if(option){
                itemLabels.push(<I18nLabel label={option.label}/>);
            }
        })

        return itemLabels.join(",");
    }
    
    let selectControl= control.disabled===true?(
        <DisabledControl inline={control.inline} value={getValueLabel(updatedValue)}  />
    ):(<Select  
        mode="multiple"
        style={{width:'100%'}}  
        placeholder={control.placeholder?<I18nLabel label={control.placeholder}/>:""} 
        value={updatedValue?.list?.map(item=>item.id)} 
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