import { useCallback, useEffect,useRef} from "react";
import {Modal} from 'antd';

import { FRAME_MESSAGE_TYPE } from '../operation';
import {convertUrl, parseUrl} from '../utils/urlParser';

import './FrameDialog.css';
import useI18n from "../hook/useI18n";

const frameType="frameDialog";

export default function FrameDialog({item}){
    const {locale,resources}=useI18n();
    const refFrame=useRef();

    const onFrameLoad=useCallback(()=>{
        if(refFrame.current){
            const url=parseUrl(item.params.url);
            refFrame.current.contentWindow.postMessage({
                type:FRAME_MESSAGE_TYPE.INIT,
                i18n:{locale,resources},
                data:{...item,frameType:frameType}},url.origin);
        }
    },[refFrame,item,locale,resources]);

    useEffect(()=>{
        if(refFrame.current){
            refFrame.current.addEventListener("load",onFrameLoad);
            const removeEventListener=refFrame.current.removeEventListener;
            return ()=>{
                removeEventListener("load",onFrameLoad);
            }
        }
    },[refFrame,onFrameLoad]);

    const {params:{key,width,height}}=item;
    const url=convertUrl(item.params.url);

    return (
        <Modal 
            className='frame-dialog-modal'
            title={null}
            closable={false}
            zIndex={100} 
            centered
            width={width}
            visible={true} 
            footer={null}>
            <iframe 
                frameBorder={0} 
                style={{width:width,height:height}} 
                title={frameType+"_"+key}
                id={frameType+"_"+key} 
                ref={refFrame} 
                scrolling={"yes"} 
                src={url} />
        </Modal>  
    )
}