import {useState} from 'react';
import {Select } from 'antd';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import {FRAME_MESSAGE_TYPE} from '../../../../../../../utils/constant';
import {getManyToOneValueFunc} from '../../../../../../../utils/functions';
import './index.css';

const { Option } = Select;

export default function MultiSelectForRelatedField({field,filterValue,onFilterChange,sendMessageToParent}){
    const {origin,item:frameItem}=useSelector(state=>state.frame);
    const [options,setOptions]=useState([]);
    
    const onChange=(value,option)=>{
        //这里的值如果不是数组的话，则替换为null
        if(value===undefined||value===null||value.length===0){
            onFilterChange(null,null);
            return;
        }
        //这里的value是一个数组，对于查询来说需要将这个数组替换为一个Op.in的查询
        const filterVal={
            'Op.in':value
        }
        const label=option.map(item=>item.children).join(',');
        onFilterChange(filterVal,label);
    }

    const getFilter=(field,value)=>{
        const fieldsFilter=field.fields.map(element => {
            const tempFieldFilter={};
            tempFieldFilter[element.field]='%'+value.replace("'","''")+'%';
            return tempFieldFilter;
        });
        
        if(field.filter===undefined||field.filter===null){
            return {'Op.or':fieldsFilter};
        }
            
        return {'Op.and':[field.filter,{'Op.or':fieldsFilter}]};
    };

    const getQueryParams=(field,value)=>{
        /**
         */
        console.log('TransferControl send query message 1',JSON.stringify(field.filterData));
        return {
            modelID:field.relatedModelID,
            fields:field.fields,
            filterData:field.filterData,
            filter:getFilter(field,value),
            pagination:{current:1,pageSize:500}
        }
    }

    const onSearch=(value)=>{
        //根据不同的情况获取不同查询条件
        const queryParams=getQueryParams(field,value);
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
            console.log('TransferControl send query message',JSON.stringify(message));
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
                console.log('queryResponse',data);
                setOptions(data.list);
            }
        }
        window.addEventListener("message",queryResponse);
        return ()=>{
            window.removeEventListener("message",queryResponse);
        }
    },[setOptions,field]);

    const onFocus=()=>{
        onSearch("");
    }

    const optionLabel=field.optionLabel?field.optionLabel:'id';

    const optionControls=options?options.map((item,index)=>{
        let label=item[optionLabel];
        if(label===undefined){
            label=getManyToOneValueFunc(optionLabel)(item)
        }
        return (<Option key={index} value={item.id}>{label}</Option>);
    }):[];

    return (<Select  
        mode="multiple"
        style={{maxWidth:200,minWidth:200,marginBottom:8,display:'block'}}
        value={filterValue?.['Op.in']} 
        allowClear={false}
        showSearch
        onSearch={onSearch}
        onChange={onChange}
        onFocus={onFocus}
        filterOption={(input, option) =>
            option.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0||
            option.value?.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }       
        >
        {optionControls}
    </Select>);
}