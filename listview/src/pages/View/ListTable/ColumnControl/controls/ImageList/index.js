import { useState,useEffect,useCallback } from 'react';
import {useSelector} from 'react-redux';
import { Image } from 'antd';
import { FRAME_MESSAGE_TYPE } from '../../../../../../utils/constant';

export default function ImageList({text,field, record, index,sendMessageToParent}){
    const {origin,item}=useSelector(state=>state.frame);
    const [images,setImages]=useState([]);

    const getImageDataKey=field.field+'_'+index;

    const getOriginImage=useCallback((files)=>{
        console.log("imagelist getOriginImage changed")
            const frameParams={
                frameType:item.frameType,
                frameID:item.params.key,
                dataKey:getImageDataKey,
                origin:origin
            };
            const message={
                type:FRAME_MESSAGE_TYPE.GET_IMAGE,
                queenable:true,
                data:{
                    frameParams:frameParams,
                    queryParams:{
                        list:files
                    }
                }
            }
            sendMessageToParent(message);
    },[sendMessageToParent,field,origin,item]);
    
    useEffect(()=>{
        console.log("imagelist addEventListener changed")
        const queryResponse=(event)=>{
            const {type,dataKey,data}=event.data;
            console.log("ImageList queryResponse",type,dataKey,data);
            if(type===FRAME_MESSAGE_TYPE.QUERY_RESPONSE&&
                dataKey===getImageDataKey&&
                data.list&&data.list.length>0){
                //const file=data.list[0];
                const images=text.list.map(item=>{
                    const file=data.list.find(element=>element.id===item.id);
                    if(file){
                        return {...item,url:file.url};
                    }
                    return item;
                });
                console.log("get images",images);
                if(images.length>0){
                    setImages(images);
                }
            }
        }
        window.addEventListener("message",queryResponse);

        return ()=>{
            window.removeEventListener("message",queryResponse);
        }
    },[setImages,text]);
    
    useEffect(()=>{
        //判断id是否有变化
        let needLoad=false;
        if(text.list&&text.list.length>0){
            if(text.list.length!=images.length){
                needLoad=true;
            } else {
                //如果两个数组中的数量一致，则检查两个list中是否有不一致的id
                images.forEach(imageItem=>{
                    if(text.list.find(item=>item.id===imageItem.id)===undefined){
                        needLoad=true;
                    }
                })
            }
        } else {
            //如果字段中没有图片，但images缓存中有图片
            if(images.length>0){
                setImages([])
            }
        }

        console.log("imagelist textupdated",text.list,images,needLoad);

        if(needLoad===true){
            //获取图片文件内容
            getOriginImage(text.list);
        }
    },[field,text,images]);

    return (
        <Image.PreviewGroup
            preview={{
                onChange: (current, prev) => console.log(`current index: ${current}, prev index: ${prev}`),
            }}
        >
            {images.map(imageItem=><Image key={imageItem.id} height={field.imageHeight??40} width={field.imageWidth??40} src={imageItem.url} />)}
        </Image.PreviewGroup>
    )
}