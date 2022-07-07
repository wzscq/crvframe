import {useEffect, useMemo, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { Space,Button,Upload,Tooltip } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

import { modiData,removeErrorField } from '../../../../../redux/dataSlice';
import {
    CC_COLUMNS,
    SAVE_TYPE
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

export default function FileControl({dataPath,control,field,sendMessageToParent}){
    const dispatch=useDispatch();
    
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
        return [];
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
                    contentBase64:selectedFile.contentBase64,
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

    const props = {
        accept:control.accept,
        showUploadList:{
            showDownloadIcon:true,
            showRemoveIcon:control.disabled!==true,
        },
        onDownload:file =>{
            sendMessageToParent(createDownloadFileMessage({list:[file]},file.name));
        },
        onRemove: file => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: file => {
            const reader = new FileReader();
            reader.onload=(e)=>{
                const fileTmp={uid:file.uid,name:file.name,contentBase64:e.target.result};
                setFileList([...fileList,fileTmp]);
                if(valueError){
                    const errFieldPath=dataPath.join('.')+'.'+field.field;
                    dispatch(removeErrorField(errFieldPath));
                }
            };
            reader.readAsDataURL(file);
            return false;
        },
        fileList,
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