import { useCallback, useMemo,useEffect, useState } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import {Space,Transfer,Tooltip } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { modiData,removeErrorField } from '../../../../../redux/dataSlice';
import {
    FRAME_MESSAGE_TYPE,
    CC_COLUMNS,
    SAVE_TYPE,
    CASCADE_TYPE
} from '../../../../../utils/constant';
import I18nLabel from '../../../../../component/I18nLabel';
import { getManyToOneValueFunc } from '../../../../../utils/functions';

import './index.css';

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
    const errFieldPath=dataPath.join('.')+'.'+field;
    return data.errorField[errFieldPath];
};

const getCascadeItemValue=(data,dataPath,field,cascade)=>{
    if(cascade&&cascade.parentField){
        let pathDeep=dataPath.length;
        if(cascade.parentPath){
            const pathArr=cascade.parentPath.split('/');
            for(let i=0;i<pathArr.length;++i){
                if(pathArr[i]==='..'){
                    /**
                     *dataPaht的形式类似[rowKey,fieldid,list,rowkey,fieldid,list,rowKey,fieldid,list, ...] 
                    *当前字段节点的path一定是一个rowKey节点，往上一层需要自动跳转到上一个rowKey节点
                    *两个rowKey间的间隔是3，因此遇到一个..，则路径深度减3
                    */
                    pathDeep-=3;
                } else {
                    break;
                }
            }
        }
        
        let updatedNode=data.updated;
        for(let i=0;i<pathDeep;++i){
            updatedNode=updatedNode[dataPath[i]];
            if(!updatedNode){
                return {};
            }
        }
        
        if(updatedNode[cascade.parentField]){
            const cascadeValue=updatedNode[cascade.parentField];
            return {[cascade.parentField]:cascadeValue.value};
        }
    }
    
    return {};
}

const selectCascadeParentValue=(data,dataPath,field,cascade)=>{
    if(Array.isArray(cascade)){
        let cascadeParentValue={};
        cascade.forEach(cascadeItem=>{
            cascadeParentValue={...cascadeParentValue,
                ...(getCascadeItemValue(data,dataPath,field,cascadeItem))     
            }
        })
        return cascadeParentValue;
    }
    return getCascadeItemValue(data,dataPath,field,cascade);
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

const resultEqualityCheck=(a,b)=>{
    return (JSON.stringify(a)===JSON.stringify(b));
}

const makeCascadeSelector=()=>{
    return createSelector(
        selectCascadeParentValue,
        (cascadeParentValue)=>{
            return cascadeParentValue;
        },
        {
            memoizeOptions:{
                resultEqualityCheck:resultEqualityCheck 
            }
        }
    );
}

export default function TransferControl({dataPath,control,field,sendMessageToParent}){
    const {origin,item:frameItem}=useSelector(state=>state.frame);
    const dispatch=useDispatch();
    
    const selectValue = useMemo(makeSelector, [dataPath,control,field]);
    const {originValue,updatedValue,valueError}=useSelector(state=>selectValue(state.data,dataPath,field.field));

    const selectCascadeValue = useMemo(makeCascadeSelector, [dataPath,control,field]);
    const cascadeParentValue=useSelector(state=>selectCascadeValue(state.data,dataPath,field.field,control.cascade));
    
    const [targetKeys,setTargetKeys]=useState(updatedValue?updatedValue.list.map(item=>item.id):[]);
    const [{loaded,options},setOptions]=useState({loaded:false,options:[]});

    /*const getCascadeItemFilter=(cascade,cascadeParentValue)=>{
        if(cascade.type===CASCADE_TYPE.MANY2ONE){
            if(cascadeParentValue&&cascade.parentField&&
               cascadeParentValue[cascade.parentField]){
                return ({[cascade.relatedField]:cascadeParentValue[cascade.parentField]});        
            }
        } else {
            console.error('not supported cascade type:',cascade.type);
        }
    }*/

    const getCascadeItemFilter=(cascade,cascadeParentValue,field)=>{
        let res={};
        if(cascade.type===CASCADE_TYPE.MANY2ONE){
            //父级字段和当前字段之前有一个many2one的关系，这个关系是维护在当前字段的关联表中的，也就是说当前字段的关联表中有一个字段指向父级字段
            //这个的relatedField就是在关联表中对应父级字段的字段，如果没有指定，则默认和父级字段(parentField)同名
            //这里的filterbyParent是指在当前字段的关联表中，根据父级字段的值来筛选出对应的记录
            if(cascade.parentField&&cascadeParentValue[cascade.parentField]){
                const relatedField=cascade.relatedField?cascade.relatedField:cascade.parentField;
                res= {filterbyParent:{[relatedField]:cascadeParentValue[cascade.parentField]}};        
            }
        } else if(cascade.type===CASCADE_TYPE.MANY2MANY){
            //父级字段和当前字段之间有一个many2many的关系，这个关系是维护在中间表中的，中间表中有两个字段分别指向父级字段和当前字段
            //这里的过滤需要分两步，先从中间表中筛选出对应当前父级字段值的字字段的ID，
            //然后再根据这些ID，从当前字段对应的关联表中筛选出对应的记录
            if(cascade.parentField&&cascadeParentValue[cascade.parentField]){
                //根据中间表先筛选出对应本表关联表的ID
                const relatedField=cascade.relatedField?cascade.relatedField:field.field;
                const parentRelatedField=cascade.parentRelatedField?cascade.parentRelatedField:cascade.parentField;
                const filterDataItem={
                    modelID:cascade.middleModelID,
                    filter:{[parentRelatedField]:cascadeParentValue[cascade.parentField]},
                    fields:[
                        {field:relatedField}
                    ]
                }
                //需要拿到父字段的关联表
                const filterbyParent={id:{'Op.in':['%{'+cascade.middleModelID+'.'+relatedField+'}']}};
                res={filterbyParent,filterDataItem};
            }
        } else {
            console.error('not supported cascade type:',cascade.type);
        }
        return res;
    }
    
    const getQueryParams=useCallback((field,control)=>{
        let filter=[];
        const filterData=control.filterData?control.filterData:[];
        if(control.cascade){
            if(Array.isArray(control.cascade)){
                control.cascade.forEach(cascadeItem=>{
                    const {filterbyParent,filterDataItem}=getCascadeItemFilter(cascadeItem,cascadeParentValue);
                    if(filterbyParent){
                        filter.push(filterbyParent);
                    }

                    if(filterDataItem){
                        filterData.push(filterDataItem);
                    }
                });
            } else {
                const {filterbyParent,filterDataItem}=getCascadeItemFilter(control.cascade,cascadeParentValue);
                if(filterbyParent){
                    filter.push(filterbyParent);
                }

                if(filterDataItem){
                    filterData.push(filterDataItem);
                }
            }
        }

        //relatedFilter是原有的名字，为了兼容，暂时保留，后续会改成filter
        if(control.relatedFilter){
            filter.push(control.relatedFilter);
        }

        if(control.filter){
            filter.push(control.filter);
        }

        if(filter.length===0){
            filter={};
        } else if (filter.length===1) {
            filter=filter[0];
        } else {
            filter={'Op.and':filter};
        }

        let pageSize=500;
        if(control.pageSize){
            pageSize=control.pageSize;
        }
        
        return {
            modelID:field.relatedModelID,
            fields:control.fields,
            filter:filter,
            filterData:filterData.length>0?filterData:undefined,
            pagination:{current:1,pageSize:pageSize}
        }
    },[cascadeParentValue]);

    const loadOptions=useCallback(()=>{
        const queryParams=getQueryParams(field,control);
        if(queryParams){
            const frameParams={
                frameType:frameItem.frameType,
                frameID:frameItem.params.key,
                dataKey:field.field,
                origin:origin
            };
            const message={
                type:FRAME_MESSAGE_TYPE.QUERY_REQUEST,
                data:{
                    frameParams:frameParams,
                    queryParams:queryParams
                }
            }
            //console.log('TransferControl send query message',message);
            sendMessageToParent(message);
        }
    },[getQueryParams,sendMessageToParent,control,field,origin,frameItem]);

    const handleChange = useCallback( (targetKeys) => {
        const saveType={};
        saveType[CC_COLUMNS.CC_SAVE_TYPE]=SAVE_TYPE.CREATE;
        const addList=targetKeys.map(key=>{
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

        setTargetKeys(targetKeys);
    
        dispatch(modiData({
            dataPath:dataPath,
            field:field.field,
            updated:{
                modelID:field.relatedModelID,
                fieldType:field.fieldType,
                associationModelID:field.associationModelID,
                list:targetKeys.map(id=>options.find(item=>item.id===id))
            },
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
    },[dispatch,dataPath,field,options,originValue,valueError]);

    useEffect(()=>{
        const queryResponse=(event)=>{
            const {type,dataKey,data}=event.data;
            if(type===FRAME_MESSAGE_TYPE.QUERY_RESPONSE&&
                dataKey===field.field){
                if(data.list&&data.list.length>0){    
                    setOptions({loaded:true,options:data.list});   
                } else {
                    setOptions({loaded:true,options:[]});   
                }
            }
        }
        window.addEventListener("message",queryResponse);
        return ()=>{
            window.removeEventListener("message",queryResponse);
        }
    },[field]);

    useEffect(()=>{
        //检查targetKeys中的所有项目是否都存在于list中
        if(loaded){
            const validKeys=options.filter(item=>{
                if(targetKeys.indexOf(item.id)>=0){
                    return true;
                }
                return false;
            }).map(item=>item.id);
            
            if(validKeys.length!==targetKeys.length){
                handleChange(validKeys);
            }
        }
    },[loaded,options,targetKeys,handleChange]);

    useEffect(()=>{
        setOptions({loaded:false,options:[]});
        loadOptions();
    },[loadOptions]);

    const getValueLabel=(item)=>{
        let label=item[optionLabel];
        if(label===undefined){
            label=getManyToOneValueFunc(optionLabel)(item);
        }
        return label;
    }

    //获取文本输入框的标签，如果form控件配置了label属性则直接使用，
    //如果控件没有配置label属性，则取字段配置的字段name
    const label=control.label?control.label:(field?field.name:"");
    const optionLabel=control.optionLabel?control.optionLabel:'id';

    const dataSource=options.map(item=>(
        
        {
        key:item.id,
        title:getValueLabel(item),
        description: getValueLabel(item),
        chosen:true
    }));

    const filterOption = (inputValue, option) => option.description.indexOf(inputValue) > -1;
    const getValueItem=(dataSource,targetKeys)=>{
        return targetKeys.map(key=>{
            const item=dataSource.find(item=>item.key===key);
            return (<div>{item?item.title:key}</div>)
        });
    }
    
    let transferControl=control.disabled===true?(
        <div style={{maxHeight:control.maxHeight?control.maxHeight:"100%",overflow:'auto'}}>{getValueItem(dataSource,targetKeys)}</div>
    ):(
        <Transfer
            style={{maxHeight:control.maxHeight?control.maxHeight:"100%"}}
            dataSource={dataSource}
            showSearch
            filterOption={filterOption}
            targetKeys={targetKeys}
            onChange={handleChange}
            render={item => item.title}
            disabled={control.disabled}
            status={valueError?'error':null}
        />
    );
    
    transferControl=valueError?(
        <Tooltip title={<I18nLabel label={valueError.message}/>}>
            {transferControl}
        </Tooltip>):transferControl;
    
    const className='control-transfer';

    return (
        <div className={className}>
            <Space size={2} direction="vertical" style={{width:'100%'}}>
                <div style={{width:'100%',textAlign:'left'}}>
                    {control.required?(<span style={{color:'red'}}>*</span>):null}
                    <I18nLabel label={label}/>
                </div>
                {transferControl}
            </Space>
        </div>
    )
}