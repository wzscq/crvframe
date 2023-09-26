import {useState,useMemo} from 'react';
import { createSelector } from '@reduxjs/toolkit';
import {Select,Space,Tooltip } from 'antd';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { modiData,removeErrorField } from '../../../../../../redux/dataSlice';
import {FRAME_MESSAGE_TYPE,CASCADE_TYPE} from '../../../../../../utils/constant';
import { getManyToOneValueFunc } from '../../../../../../utils/functions';
import I18nLabel from '../../../../../../component/I18nLabel';
import DisabledControl from '../../DisabledControl';

import './index.css';

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
        selectUpdatedValue,
        selectValueError,
        (updatedValue,valueError)=>{
            return {updatedValue,valueError};
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

export default function SingleSelectForManyToOne({dataPath,control,field,sendMessageToParent}){
    const dispatch=useDispatch();
    const {origin,item:frameItem}=useSelector(state=>state.frame);
    
    const selectValue = useMemo(makeSelector, [dataPath,control,field]);
    const {updatedValue,valueError}=useSelector(state=>selectValue(state.data,dataPath,field.field));

    const selectCascadeValue = useMemo(makeCascadeSelector, [dataPath,control,field]);
    const cascadeParentValue=useSelector(state=>selectCascadeValue(state.data,dataPath,field.field,control.cascade));

    const [options,setOptions]=useState([]);
    const [lastCascadeParentValue,setLastCascadeParentValue]=useState(cascadeParentValue);
    
    const onChange=(value)=>{
        if(value===undefined){
            value=null;
        }

        const updated=(value===null)?{
                value:null,
                list:[],
                total:0,
                fieldType:field.fieldType,
                modelID:field.relatedModelID
            }:{
                value:value,
                list:[options.find(item=>item.id===value)],
                total:1,
                fieldType:field.fieldType,
                modelID:field.relatedModelID
            }

        dispatch(modiData({
            dataPath:dataPath,
            field:field.field,
            updated:updated,
            update:value}));
        
        if(valueError){
            const errFieldPath=dataPath.join('.')+'.'+field.field;
            dispatch(removeErrorField(errFieldPath));
        }
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

    const getCascadeItemFilter=(cascade,cascadeParentValue,field)=>{
        let res={};
        if(cascade.type===CASCADE_TYPE.MANY2ONE){
            if(cascade.parentField&&cascadeParentValue[cascade.parentField]){
                const relatedField=cascade.relatedField?cascade.relatedField:cascade.parentField;
                res= {filterbyParent:{[relatedField]:cascadeParentValue[cascade.parentField]}};        
            }
        } else if(cascade.type===CASCADE_TYPE.MANY2MANY){
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

    const getQueryParams=(field,control,value)=>{
        /**
         * 这里因为考虑级联选择的逻辑，查询下拉选择项的处理方式会有差异
         * 在没有级联关系的情况下，直接根据检索条件查询关联表即可
         * 对于有级联关系的情况，需要按照级联关系的控制方式来确定数据查询逻辑，
         * 
         * 级联关系字段存在以下4种情况（目前程序仅实现前2个情况），
         * 情况1：
         *      级联关系中父字段（如p_id）是多对一关联字段，对应了关联表p，
         *      子字段可以是多对一或者多对多字段，对应了关联表c,
         *      同时在子字段对应的关联表c中也存在多对一关联字段(如 c_p_id)，对应关联表p。
         *      这种情况，在查询子字段对应的关联表c的数据时，需要在查询条件中补充c_p_id=cascadeParentValue作为查询的先决条件。
         * 
         * 情况2：
         *      这种情况可以认为是情况1的扩展，父级字段同情况1
         *      子字段是一个一对多虚拟字段，关联到作为主从表中的明细表d，
         *      同时在明细表d中有一个多对一字段，对应关联表c
         *      关联表c中也存在多对一关联字段(如 c_p_id)，对应关联表p。
         *      这种情况，可以认为是情况一中子字段为多对多的特殊形式（多对多中间表为自定义表的情况，比简单的多对多增加一些属性）
         *      这种情况使用明细表控件，级联关系配置在一对多字段上，明细表下级字段可以使用父级级联字段的值实现过滤。
         * 
         * 情况3：表c和表p存在多对多关联关系。对于这种情况，需要将查询c表的操作转换为查询p表的操作，
         * 同时在查询p表操作时将关联到c表的多对多字段中补充对c对应字段的查询。
         *
         * 情况4：有另外一个表d，表d中存在两个多对一关联字段p_id和c_id，其中p_id关联表p，c_id关联到表c。
         * 对于这种情况需要将查询c表的操作转换为查询d表的操作，在查询d表时按照p_id=cascadeParentValue过滤d表数据
         * 同时以c_id字段查询过滤c表数据。这种情况需要前端再做一次数据过滤。目前程序暂时不实现这个逻辑。
         */
        const filter=getFilter(control,value);
        if(control.cascade){
            const filterCascade=[filter];
            const filterData=control.filterData?control.filterData:[];
            if(Array.isArray(control.cascade)){
                control.cascade.forEach(cascadeItem=>{
                    const {filterbyParent,filterDataItem}=getCascadeItemFilter(cascadeItem,cascadeParentValue,field);
                    if(filterbyParent){
                        filterCascade.push(filterbyParent);
                    }
                    if(filterDataItem){
                        filterData.push(filterDataItem);
                    }
                });
            } else {
                const {filterbyParent,filterDataItem}=getCascadeItemFilter(control.cascade,cascadeParentValue,field);
                if(filterbyParent){
                    filterCascade.push(filterbyParent);
                }
                if(filterDataItem){
                    filterData.push(filterDataItem);
                }
            }
                    
            const op='Op.and';
            const mergedFilter={[op]:filterCascade};
            return {
                modelID:field.relatedModelID,
                fields:control.fields,
                filterData:filterData.length>0?filterData:undefined,
                filter:mergedFilter,
                pagination:{current:1,pageSize:500}
            }
        }
        
        return {
            modelID:field.relatedModelID,
            fields:control.fields,
            filterData:control.filterData,
            filter:filter,
            pagination:{current:1,pageSize:500}
        }
    }

    const onSearch=(value)=>{
        //根据不同的情况获取不同查询条件
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
            
            sendMessageToParent(message);
        }
    };

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

    //获取文本输入框的标签，如果form控件配置了label属性则直接使用，
    //如果控件没有配置label属性，则取字段配置的字段name
    const label=control.label?control.label:(field?field.name:"");
    const optionLabel=control.optionLabel?control.optionLabel:'id';
    
    let hasOriginValue=false;
    const optionControls=options?options.map((item,index)=>{
        if(updatedValue&&item.id===updatedValue.value){
            hasOriginValue=true;
        }
        let label=item[optionLabel];
        if(label===undefined){
            label=getManyToOneValueFunc(optionLabel)(item);
        }
        return (<Option key={item.id} value={item.id}>{label}</Option>);
    }):[];

    const getValueLabel=(updatedValue)=>{
        const item=updatedValue.list[0];
        let label=item[optionLabel];
        if(label===undefined){
            label=getManyToOneValueFunc(optionLabel)(item);
        }
        return label;
    }

    if(hasOriginValue===false&&updatedValue&&updatedValue.list&&updatedValue.list.length>0){
        const item=updatedValue.list[0];
        const label=getValueLabel(updatedValue);
        optionControls.push(<Option key={'origin'} value={item.id}>{label}</Option>);
    }

    let selectControl=control.disabled===true?(
        <DisabledControl inline={control.inline} value={updatedValue?.list?.length>0?getValueLabel(updatedValue):""} />
    ):(<Select
        style={{width:'100%'}}  
        placeholder={control.placeholder?control.placeholder:""} 
        value={updatedValue?updatedValue.value:updatedValue} 
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

    console.log('singleSelect valueError:',valueError);

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