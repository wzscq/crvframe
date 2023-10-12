import {useEffect, useMemo, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { Space,Button,Upload,Tooltip } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

import { modiData,removeErrorField } from '../../../../../redux/dataSlice';
import {
    CC_COLUMNS,
    SAVE_TYPE,
    FRAME_MESSAGE_TYPE
} from '../../../../../utils/constant';
import {createDownloadFileMessage} from '../../../../../utils/normalOperations';
import I18nLabel from '../../../../../component/I18nLabel';

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

export default function UploadControl({dataPath,control,field,sendMessageToParent}){
    const dispatch=useDispatch();
    const {origin,item:frameItem}=useSelector(state=>state.frame);
    const selectValue=useMemo(makeSelector,[dataPath,control,field]);
    const {originValue,valueError}=useSelector(state=>selectValue(state.data,dataPath,field.field));

    const initFileList=useMemo(()=>{
        if(originValue){
            return originValue.list.map(item=>
            {
                return {
                    ...item,
                    uid:item.id,
                    status: 'done',
                }
            });
        }
        return [/*{
            "uid": "rc-upload-1696934440736-3",
            "lastModified": 1566524493006,
            "lastModifiedDate": "2019-08-23T01:41:33.006Z",
            "name": "Docker for Windows Installer.exe",
            "size": 875349208,
            "type": "application/x-msdownload",
            "percent": 49.10617523131574,
            "originFileObj": {
                "uid": "rc-upload-1696934440736-3"
            },
            "status": "uploading"
        }*/];
    },[originValue]);
    
    const [fileList,setFileList]=useState(initFileList);

    const className=valueError?'control-singlefile control-singlefile-error':'control-singlefile control-singlefile-normal';
    
    //获取文本输入框的标签，如果form控件配置了label属性则直接使用，
    //如果控件没有配置label属性，则取字段配置的字段name
    const label=control.label?control.label:(field?field.name:"");

    useEffect(()=>{
        const data=fileList;
        const saveType={};
        saveType[CC_COLUMNS.CC_SAVE_TYPE]=SAVE_TYPE.CREATE;
        const addList=data.map(selectedFile=>{
            const originItem=originValue?originValue.list.find(item=>item.id===selectedFile.uid):null;
            if(originItem){
                return {id:originItem.id};
            } else {
                return {
                    id:selectedFile.uid,
                    name:selectedFile.name,
                    key:selectedFile.key,
                    ...saveType
                };
            }
        });

        saveType[CC_COLUMNS.CC_SAVE_TYPE]=SAVE_TYPE.DELETE;
        const delList=originValue?originValue.list.map(item=>{
            const newItem=addList.find(element=>element.id===item.id);
            if(newItem){
                return {id:item.id};
            } else {
                return {...item,...saveType};
            }
        }):[];

        const list = addList.concat(delList).filter(item=>item[CC_COLUMNS.CC_SAVE_TYPE]);
        if(list.length>0){
            dispatch(modiData({
                dataPath:dataPath,
                field:field.field,
                updated:{
                    fieldType:field.fieldType,
                    list:data
                },
                update:{
                    fieldType:field.fieldType,
                    list:list
                }}));
        }
    },[fileList,dispatch,field,dataPath,originValue]);

    console.log('fileList',fileList);

    const getUploadKey=()=>{
        return new Promise((resolve) => {
            const getUploadKeyResponse=(event)=>{
                const {type,dataKey,data}=event.data;
                if(type===FRAME_MESSAGE_TYPE.GET_UPLOAD_KEY_RESPONSE&&
                    dataKey===field.field){
                    console.log('getUploadKey',data);
                    resolve(data.key);
                }
                window.removeEventListener("message",getUploadKeyResponse);
            }
            window.addEventListener("message",getUploadKeyResponse);
           
            const frameParams={
                frameType:frameItem.frameType,
                frameID:frameItem.params.key,
                dataKey:field.field,
                origin:origin
            };
    
            const message={
                type:FRAME_MESSAGE_TYPE.GET_UPLOAD_KEY,
                data:{
                    frameParams:frameParams,
                    params:{}
                }
            }
            
            sendMessageToParent(message);
        });
    }

    const uploadFile=(fileList,file,key)=>{
        //获取上传令牌
        var data = new FormData();
        data.append('file', file);
        data.append('key', key);
        axios({
        method: 'post',
        url: process.env.REACT_APP_SERVICE_API_PREFIX+"/data/upload",
        data: data,
        onUploadProgress: function(progressEvent) {
            var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
            //console.log(percentCompleted,file);
            const newFile={uid:file.uid,key:key,name:file.name,status:'uploading',percent:percentCompleted}
            console.log(percentCompleted,newFile);
            setFileList([...fileList,newFile]);
        }
        })
        .then(function (response) {
            console.log('Success:', response);
            const newFile={uid:file.uid,key:key,name:file.name,status:'done',percent:100}
            setFileList([...fileList, newFile]);
        })
        .catch(function (error) {
            console.log('Error:', error);
            const newFile={uid:file.uid,key:key,name:file.name,status:'error',percent:100}
            setFileList([...fileList,newFile]);
        });
    }

    const props = {
        accept:control.accept,
        showUploadList:{
            showDownloadIcon:true,
            showRemoveIcon:control.disabled!==true,
        },
        onDownload:file =>{
            sendMessageToParent(createDownloadFileMessage({list:[file]},file.name,true));
        },
        onRemove: file => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: file => {
            console.log('beforeUpload',file);
            //setFileList([...fileList, file]);
            if(valueError){
                const errFieldPath=dataPath.join('.')+'.'+field.field;
                dispatch(removeErrorField(errFieldPath));
            }
            getUploadKey().then((key)=>{
                uploadFile(fileList,file,key);
            });
            return false;
        },
        fileList
    };

    let fileControl=(
        <Upload {...props}>
            {
                (fileList.length<control.maxCount)?(
                    <Button danger={valueError?true:false} disabled={control.disabled} icon={<UploadOutlined />}>
                        <I18nLabel label={control.selectButtonLabel?control.selectButtonLabel:'选择文件'}/>
                    </Button>
                ):null
            }
        </Upload>
    );

    fileControl=valueError?(
        <Tooltip title={<I18nLabel label={valueError.message}/>}>
            {fileControl}
        </Tooltip>):fileControl;
 
    if(control.inline){
        return fileControl;
    }
 
    return (
        <div className={className}>
            <Space size={2} direction="vertical" style={{}}>
                <div style={{width:'100%',textAlign:'left'}}>
                    {control.required?(<span style={{color:'red'}}>*</span>):null}
                    <I18nLabel label={label}/>
                </div>
                {fileControl} 
            </Space>
        </div>
    )
}