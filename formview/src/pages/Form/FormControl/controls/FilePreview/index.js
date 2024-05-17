import {useEffect, useMemo, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { Space,Select} from 'antd';
import I18nLabel from '../../../../../component/I18nLabel';
import {
    FRAME_MESSAGE_TYPE
} from '../../../../../utils/constant';
import Preview from './Preview';

const { Option } = Select;

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

const selectValueError=(data,dataPath,field)=>{
    const errFieldPath=dataPath.join('.')+'.'+field;
    return data.errorField[errFieldPath];
}

const makeSelector=()=>{
    return createSelector(
        selectUpdatedValue,
        selectOriginValue,
        selectValueError,
        (updatedValue,valueError)=>{
        return {updatedValue,valueError}
    });
}

export default function FilePreview({dataPath,control,field,sendMessageToParent}){
    const selectValue=useMemo(makeSelector,[dataPath,control,field]);
    const {updatedValue}=useSelector(state=>selectValue(state.data,dataPath,field.field));
    const {origin,item:frameItem}=useSelector(state=>state.frame);

    const [currentItem,setCurrentItem]=useState(updatedValue?.list?.length>0?updatedValue.list[0]:null);

    const listOptions=updatedValue?.list?.map(item=>{
        return (<Option key={item.id} value={item.id}>{item.name}</Option>);
    });

    const onChange=(value)=>{
        updatedValue?.list?.forEach(element => {
            if(element.id===value){
                setCurrentItem({...element});
            }
        });
    }

    console.log('element:',JSON.stringify(currentItem));

    useEffect(()=>{
        const queryResponse=(event)=>{
            const {type,dataKey,data}=event.data;
            if(type===FRAME_MESSAGE_TYPE.QUERY_RESPONSE&&
                dataKey===field.field&&
                data.list&&data.list.length>0){
                console.log('filedata:',data);
                setCurrentItem({...currentItem,contentBase64:data.list[0].url});
            }
        }
        window.addEventListener("message",queryResponse);

        return ()=>{
            window.removeEventListener("message",queryResponse);
        }
    },[currentItem,setCurrentItem]);

    useEffect(()=>{
        if(currentItem!==null&&currentItem.contentBase64===undefined){
            const frameParams={
                frameType:frameItem.frameType,
                frameID:frameItem.params.key,
                dataKey:field.field,
                origin:origin
            };
            const message={
                type:FRAME_MESSAGE_TYPE.GET_IMAGE,
                data:{
                    frameParams:frameParams,
                    queryParams:{
                        list:[currentItem]
                    }
                }
            }
            sendMessageToParent(message);
        }
    },[currentItem,sendMessageToParent,frameItem,origin,field]);

    //获取文本输入框的标签，如果form控件配置了label属性则直接使用，
    //如果控件没有配置label属性，则取字段配置的字段name
    const label=control.label?control.label:(field?field.name:"");

    const fileControl=useMemo(()=>(
            <div style={{width:'100%'}}>
                <Select  
                    value={currentItem?.id} 
                    onChange={onChange}
                    >
                    {listOptions}
                </Select>
                {currentItem?<Preview item={currentItem} height={control.maxHeight}/>:null}
            </div>
        ),[currentItem]);

    return (
        <div style={{width:'100%'}}>
            <Space size={2} direction="vertical" style={{width:'100%'}}>
                <div style={{width:'100%',textAlign:'left'}}>
                    <I18nLabel label={label}/>
                </div>
                {fileControl}
            </Space>
        </div>
    );
}