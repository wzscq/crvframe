import {useEffect, useCallback,useMemo, useState,useRef} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { Space,Tooltip } from 'antd';
import { Editor } from '@tinymce/tinymce-react';

import { modiData,removeErrorField } from '../../../../../redux/dataSlice';
import {
    CC_COLUMNS,
    FRAME_MESSAGE_TYPE,
    SAVE_TYPE
} from '../../../../../utils/constant';
import {utf8_to_b64,
    b64_to_utf8} from '../../../../../utils/functions'; 
import I18nLabel from '../../../../../component/I18nLabel';

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
};

const makeSelector=()=>{
    return createSelector(
        selectOriginValue,
        selectValueError,
        (originValue,valueError)=>{
            return {originValue,valueError};
        }
    );
}

export default function RichText({dataPath,control,field,sendMessageToParent}){
    const {origin,item:frameItem}=useSelector(state=>state.frame);
    const dispatch=useDispatch();
    
    const selectValue=useMemo(makeSelector,[dataPath,control,field]);
    const {originValue,valueError}=useSelector(state=>selectValue(state.data,dataPath,field.field));

    const [originContent,setOriginContent]=useState("");

    const getOriginImage=useCallback((files)=>{
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
                    list:files
                }
            }
        }
        console.log('ImageList send getImage message',message);
        sendMessageToParent(message);
    },[sendMessageToParent,field,origin,frameItem]);

    useEffect(()=>{
        const queryResponse=(event)=>{
            const {type,dataKey,data}=event.data;
            if(type===FRAME_MESSAGE_TYPE.QUERY_RESPONSE&&
                dataKey===field.field&&
                data.list&&data.list.length>0){
                const file=data.list[0];
                const contentBase64=file.url;
                console.log('contentBase64:'+contentBase64);
                const content=b64_to_utf8(contentBase64);
                console.log('content:'+content);
                setOriginContent(content);
            }
        }
        window.addEventListener("message",queryResponse);

        return ()=>{
            window.removeEventListener("message",queryResponse);
        }
    },[field,originValue]);

    useEffect(()=>{
        if(originValue&&originValue.list&&originValue.list.length>0){
            //获取图片文件内容
            getOriginImage(originValue.list);
        }
    },[originValue,getOriginImage]);


    const className=valueError?'control-singlefile control-singlefile-error':'control-singlefile control-singlefile-normal';
    
    //获取文本输入框的标签，如果form控件配置了label属性则直接使用，
    //如果控件没有配置label属性，则取字段配置的字段name
    const label=control.label?control.label:(field?field.name:"");

    const editorRef = useRef(null);
    const onContentChange=()=>{
        console.log('richtext content changed');
        const content=editorRef.current.getContent();
        const base64Content=utf8_to_b64(content);
        //这里仿照文件控件的结构来处理，仅保留当前内容
        const saveType={};
        saveType[CC_COLUMNS.CC_SAVE_TYPE]=SAVE_TYPE.CREATE;
        //新的内容都是按照新增文件来处理
        const addList=[
            {name:field.field,contentBase64:base64Content,...saveType}
        ];

        saveType[CC_COLUMNS.CC_SAVE_TYPE]=SAVE_TYPE.DELETE;
        const delList=originValue?originValue.list.map(item=>{
            return {...item,...saveType};
        }):[];

        const list = addList.concat(delList);
        console.log(addList);
        if(list.length>0){
            dispatch(modiData({
                dataPath:dataPath,
                field:field.field,
                updated:{
                    fieldType:field.fieldType,
                    list:addList
                },
                update:{
                    fieldType:field.fieldType,
                    list:list
                }}));
        }

        if(valueError){
            const errFieldPath=dataPath.join('.')+'.'+field.field;
            dispatch(removeErrorField(errFieldPath));
        }
    }

    console.log('TINYMCE_URL:',process.env.REACT_APP_TINYMCE_URL);

    let fileControl=(
        <Editor
            tinymceScriptSrc={process.env.REACT_APP_TINYMCE_URL}
            onInit={(evt, editor) => {
                editorRef.current = editor;
                editor.on('change', onContentChange);
            }}
            initialValue={originContent}
            init={{
            height: control.height,
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
                'bold italic forecolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
            }}
            />
    );

    fileControl=valueError?(
        <Tooltip title={<I18nLabel label={valueError.message}/>}>
            {fileControl}
        </Tooltip>):fileControl;
    
    return (
        <div className={className}>
            <Space size={2} direction="vertical" style={{width:'100%'}}>
                <div style={{width:'100%',textAlign:'left',display:control.showLable===false?'none':'block'}}>
                    {control.required?(<span style={{color:'red'}}>*</span>):null}
                    <I18nLabel label={label}/>
                </div>
                {fileControl} 
            </Space>
        </div>
    );
}