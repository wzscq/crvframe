import {useEffect, useCallback,useMemo, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { Space,Upload,Tooltip,Image,message,Button} from 'antd';
import { PlusOutlined,EditOutlined } from '@ant-design/icons';

import { modiData,removeErrorField } from '../../../../../redux/dataSlice';
import {
    CC_COLUMNS,
    FRAME_MESSAGE_TYPE,
    SAVE_TYPE
} from '../../../../../utils/constant';
import {createDownloadFileMessage} from '../../../../../utils/normalOperations';
//import Preview from './Preview';
import Editor from './Editor';
import I18nLabel from '../../../../../component/I18nLabel';
import useI18n from '../../../../../hook/useI18n';

import "./index.css";

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

export default function ImageList({dataPath,control,field,sendMessageToParent}){
    const {origin,item:frameItem}=useSelector(state=>state.frame);
    const dispatch=useDispatch();
    const {getLocaleLabel}=useI18n();
    const [messageApi, contextHolder] = message.useMessage();
    
    const selectValue=useMemo(makeSelector,[dataPath,control,field]);
    const {originValue,valueError}=useSelector(state=>selectValue(state.data,dataPath,field.field));

    const initFileList=useMemo(()=>{
        if(originValue){
            //添加监听函数
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
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

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
        sendMessageToParent(message);
    },[sendMessageToParent,field,origin,frameItem]);

    useEffect(()=>{
        const queryResponse=(event)=>{
            const {type,dataKey,data}=event.data;
            if(type===FRAME_MESSAGE_TYPE.QUERY_RESPONSE&&
                dataKey===field.field&&
                data.list&&data.list.length>0){
                //const file=data.list[0];
                const newFileList=fileList.map(item=>{
                    const file=data.list.find(element=>element.id===item.id);
                    if(file){
                        return {...item,url:file.url};
                    }
                    return item;
                });
                setFileList(newFileList);
            }
        }
        window.addEventListener("message",queryResponse);

        return ()=>{
            window.removeEventListener("message",queryResponse);
        }
    },[field,fileList]);

    useEffect(()=>{
        if(originValue&&originValue.list&&originValue.list.length>0){
            //获取图片文件内容
            getOriginImage(originValue.list);
        }
    },[originValue,getOriginImage]);


    const className=valueError?'control-imagelist control-imagelist-error':'control-imagelist control-imagelist-normal';
    
    //获取文本输入框的标签，如果form控件配置了label属性则直接使用，
    //如果控件没有配置label属性，则取字段配置的字段name
    const label=control.label?control.label:(field?field.name:"");

    useEffect(()=>{
        const data=fileList;
        const saveType={};
        
        const addList=data.map(selectedFile=>{
            const originItem=originValue?originValue.list.find(item=>item.id===selectedFile.uid):null;
            if(originItem){
                //判断其是否修改
                if(selectedFile.changed===true){
                    saveType[CC_COLUMNS.CC_SAVE_TYPE]=SAVE_TYPE.UPDATE;
                    return {
                        ...originItem,
                        contentBase64:selectedFile.contentBase64,
                        ...saveType
                    }
                }
                return {id:originItem.id};
            } else {
                saveType[CC_COLUMNS.CC_SAVE_TYPE]=SAVE_TYPE.CREATE;
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

    console.log("ImageList control.allowEditImage",control.allowEditImage)

    const props = {
        listType:"picture-card",
        accept:control.accept,
        showUploadList:{
            showDownloadIcon:true,
            showRemoveIcon:control.disabled!==true,
            showPreviewIcon:true,
            previewIcon:control.allowEditImage===true?<Button className='imagelist-image-edit-icon' style={{padding:0}} title={getLocaleLabel({key:"page.formview.imageList.edit",default:"编辑图片"})} type="link" variant="text" size='small'><EditOutlined /></Button>:null,
        },
        /*itemRender:(originNode, file)=>{
            return (<Preview 
                        maxPreviewWidth={control.maxPreviewWidth} 
                        maxPreviewHeight={control.maxPreviewHeight}  
                        file={file}>
                        {originNode}
                    </Preview>);
        },*/
        onPreview:file => {
            console.log("ImageList onPreview",file)
            if(file.url){
                setPreviewImage(file);
                setPreviewOpen(true);
            }
        },
        onDownload:file =>{
            if(file.id){
                sendMessageToParent(createDownloadFileMessage({list:[file]},file.name));
            }
        },
        onRemove: file => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: file => {
            console.log("imageList size:",file.size)
            if(control.maxFileSize&&file.size>control.maxFileSize){
                messageApi.open({
                    type: 'warning',
                    content: control.maxFileSizeWarning,
                });
                return;
            }

            const reader = new FileReader();
            reader.onload=(e)=>{
                const fileTmp={uid:file.uid,name:file.name,contentBase64:e.target.result,status: 'done',url:e.target.result};
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
            {(fileList.length<control.maxCount)?(
                <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>
                        <I18nLabel label={control.selectButtonLabel?control.selectButtonLabel:'选择图片'}/>
                    </div>
                </div>
            ):null}
        </Upload>
    );

    fileControl=valueError?(
        <Tooltip title={<I18nLabel label={valueError.message}/>}>
            {fileControl}
        </Tooltip>):fileControl;

    console.log('ImageList previewImage',previewImage,previewOpen)

    const onEditorOk=useCallback((getDataUrl)=>{
        const newDataUrl=getDataUrl();
        const fileTmp={...previewImage,contentBase64:newDataUrl,url:newDataUrl,changed:true};
        //从fileList中找到对应文件的索引位置
        const newFileList=fileList.map(fileItem=>{
            if(fileItem.uid===fileTmp.uid){
                return fileTmp;
            }
            return fileItem;
        })

        setFileList(newFileList);

        setPreviewImage(null)
        setPreviewOpen(false)
    },[fileList,previewImage])

    const onEditorCancel=()=>{
        setPreviewImage(null)
        setPreviewOpen(false)
    }

    console.log('ImageList',control)
    
    return (
        <>
        {contextHolder}
        <div className={className}>
            <Space size={2} direction="vertical" style={{}}>
                <div style={{width:'100%',textAlign:'left'}}>
                    {control.required?(<span style={{color:'red'}}>*</span>):null}
                    <I18nLabel label={label}/>
                </div>
                {fileControl} 
            </Space>
        </div>
        {previewImage && (
            control.allowEditImage===true?
            <Editor fonts={control.imageTextFonts} width={control.maxPreviewWidth??'calc(100% - 10px)'}  height={control.maxPreviewHeight??'300px'} src={previewImage.url} title={previewImage.name} open={previewOpen} onEditorOk={onEditorOk} onEditorCancel={onEditorCancel}/>:
            <Image
                wrapperStyle={{ display: 'none' }}
                preview={{
                    visible: previewOpen,
                    onVisibleChange: visible => setPreviewOpen(visible),
                    afterOpenChange: visible => !visible && setPreviewImage(''),
                }}
                src={previewImage.url}
            />
        )}
        </>
    )
}