import {useState,useMemo} from 'react';
import { createSelector } from '@reduxjs/toolkit';
import {Select,Space,Tooltip } from 'antd';
import { useEffect,useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { modiData,removeErrorField } from '../../../../../../redux/dataSlice';
import {
    FRAME_MESSAGE_TYPE,
    CASCADE_TYPE,
    CC_COLUMNS,
    SAVE_TYPE
} from '../../../../../../utils/constant';
import { getManyToOneValueFunc } from '../../../../../../utils/functions';
import I18nLabel from '../../../../../../component/I18nLabel';
import DisabledControl from '../../DisabledControl';

import './index.css';

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
    const errFieldPath=dataPath.join('.')+'.'+field;

    console.log('singleSelect errFieldPath:',errFieldPath);

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

export default function MultiSelectForManyToMany({dataPath,control,field,sendMessageToParent}){
    const dispatch=useDispatch();
    const {origin,item:frameItem}=useSelector(state=>state.frame);
    
    const selectValue = useMemo(makeSelector, [dataPath,control,field]);
    const {originValue,updatedValue,valueError}=useSelector(state=>selectValue(state.data,dataPath,field.field));

    const selectCascadeValue = useMemo(makeCascadeSelector, [dataPath,control,field]);
    const cascadeParentValue=useSelector(state=>selectCascadeValue(state.data,dataPath,field.field,control.cascade));

    const [options,setOptions]=useState([]);
    const [lastCascadeParentValue,setLastCascadeParentValue]=useState(cascadeParentValue);
    
    const onChange=(value)=>{
        const saveType={};
        saveType[CC_COLUMNS.CC_SAVE_TYPE]=SAVE_TYPE.CREATE;
        const addList=value.map(key=>{
            const originItem=originValue?originValue.list.find(item=>item.id===key):null;
            if(originItem){
                return {...originItem};
            } else {
                const opItem=options.find(option=>option.id===key);
                return {...opItem,...saveType};
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

    const getFilter=(control,value)=>{
        const fieldsFilter=control.fields.map(element => {
            const tempFieldFilter={};
            tempFieldFilter[element.field]='%'+value.replace("'","")+'%';
            return tempFieldFilter;
        });
        const op='Op.or';
        //如果control本身带了过滤条件，则需要合并到搜索条件中
        if(control.filter){
            return {'Op.and':[control.filter,{[op]:fieldsFilter}]};
        }
        return {[op]:fieldsFilter};
    };
    
    const getQueryParams=useCallback((field,control,value)=>{
        let filter=[getFilter(control,value)];
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

    const onSearch=useCallback((value)=>{
        const queryParams=getQueryParams(field,control,value);
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

    /*useEffect(()=>{
        onSearch("");
    },[onSearch]);*/

    useEffect(()=>{
        const queryResponse=(event)=>{
            const {type,dataKey,data}=event.data;
            if(type===FRAME_MESSAGE_TYPE.QUERY_RESPONSE&&
                dataKey===field.field){
                setOptions(data.list);
            }
        }
        window.addEventListener("message",queryResponse);
        return ()=>{
            window.removeEventListener("message",queryResponse);
        }
    },[setOptions,field]);

    useEffect(()=>{
        //当cascadeParentValue发生变化时，清空字段的值
        //第一次进入时不做清空操作，后续判断 cascadeParentValue 是否发生变化，
        //如果变化则清空字段值
        if(JSON.stringify(lastCascadeParentValue)!==JSON.stringify(cascadeParentValue)){
            setLastCascadeParentValue(cascadeParentValue);
            onChange();
        }
    },[cascadeParentValue]);

    const onFocus=()=>{
        onSearch("");
    }

    const getValueLabel=(updatedValue)=>{
        const labels=[]
        updatedValue.list.forEach(item=>{;
            let label=item[optionLabel];
            if(label===undefined){
                label=getManyToOneValueFunc(optionLabel)(item);
            }
            labels.push(label);
        });
        return labels.join(",");
    }

    //获取文本输入框的标签，如果form控件配置了label属性则直接使用，
    //如果控件没有配置label属性，则取字段配置的字段name
    const label=control.label?control.label:(field?field.name:control.field);
    const optionLabel=control.optionLabel?control.optionLabel:'id';
    
    const optionControls=options?options.map((item,index)=>{
        let label=item[optionLabel];
        if(label===undefined){
            label=getManyToOneValueFunc(optionLabel)(item);
        }
        return (<Option key={item.id} value={item.id}>{label}</Option>);
    }):[];

    if(updatedValue?.list?.length>0){
        updatedValue.list.forEach(item=>{
            const findItem=options?.find(option=>option.id===item.id);
            if(findItem===undefined){

                let label=item[optionLabel];
                if(label===undefined){
                    label=getManyToOneValueFunc(optionLabel)(item);
                }
                optionControls.push(<Option key={item.id} value={item.id}>{label}</Option>);
            }
        })
    }

    let selectControl=control.disabled===true?(
        <DisabledControl inline={control.inline} value={updatedValue?.list?.length>0?getValueLabel(updatedValue):""} />
    ):(<Select
        mode="multiple"
        style={{width:'100%'}}  
        placeholder={control.placeholder?control.placeholder:""} 
        value={updatedValue?.list?.map(item=>item.id)} 
        allowClear
        showSearch
        disabled={control.disabled} 
        onSearch={onSearch}
        onChange={onChange}
        onFocus={onFocus}
        filterOption={(input, option) =>
            option.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0||
            option.value?.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }       
        status={valueError?'error':null}
        >
        {optionControls}
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
    );
}