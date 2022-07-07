import {useState} from 'react';
import {Select } from 'antd';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import {FRAME_MESSAGE_TYPE} from '../../../../../../../utils/constant';
import './index.css';

const { Option } = Select;

export default function SingleSelectForManyToOne({field,filterValue,onFilterChange,sendMessageToParent}){
    const {origin,item:frameItem}=useSelector(state=>state.frame);
    const [options,setOptions]=useState([]);
    
    const onChange=(value)=>{
        onFilterChange(value);
    }

    const getFilter=(field,value)=>{
        const fieldsFilter=field.fields.map(element => {
            const tempFieldFilter={};
            tempFieldFilter[element.field]='%'+value+'%';
            return tempFieldFilter;
        });
        const op='Op.or';
        return {[op]:fieldsFilter};
    };

    const getQueryParams=(field,value)=>{
        /**
         */
        return {
            modelID:field.relatedModelID,
            fields:field.fields,
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
            console.log('TransferControl send query message',message);
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
        return (<Option key={index} value={item.id}>{item[optionLabel]}</Option>);
    }):[];

    return (<Select  
        style={{minWidth:200,marginBottom:8,display:'block'}}
        value={filterValue} 
        allowClear
        showSearch
        onSearch={onSearch}
        onChange={onChange}
        onFocus={onFocus}
        filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0||
            option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }       
        >
        {optionControls}
    </Select>);
}