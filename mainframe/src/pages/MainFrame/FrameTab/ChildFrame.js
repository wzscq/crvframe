import { useEffect,useRef, useState} from "react";

import { FRAME_MESSAGE_TYPE } from '../../../operation';
import {convertUrl, parseUrl} from '../../../utils/urlParser';

const frameType="tabframe";

export default function ChildFrame({item,locale,resources,isActive}){
    const refFrame=useRef();
    const [lastLocale,setLastLocale]=useState(undefined);

    console.log('ChildFrame',lastLocale,locale,isActive,item);

    //注意这里的处理逻辑，当locale=undefined时表示语言资源尚未加载，这时暂不渲染iframe，
    //当locale!=undefined而lastLocale=undefined时表示iframe第一次渲染，这时触发子页的INIT
    //当locale!=undefined且lastLocale！=undefined表示iframe已经初始化了，只是语言项更新
    //这里的逻辑控制要注意确保子页面的INIT仅触发一次，否则由于多次加载页面数据，程序会报错
    //这个问题也可以在子页面增加校验来避免逻辑冲突，但是这里的防护可以减少不必要的后续逻辑处理，效率更高
    useEffect(()=>{
        if(refFrame.current&&locale!==undefined){
            if(lastLocale===undefined){
                const onFrameLoad=()=>{
                    console.log('ChildFrame INIT ',item.params.key);
                    const url=parseUrl(item.params.url);
                    refFrame.current.contentWindow.postMessage({
                        type:FRAME_MESSAGE_TYPE.INIT,
                        i18n:{locale,resources},
                        data:{...item,
                        frameType:frameType}},url.origin);
                    setLastLocale(locale);
                };
                refFrame.current.addEventListener("load",onFrameLoad);
                const removeEventListener=refFrame.current.removeEventListener;
                return ()=>{
                    console.log('ChildFrame removeEventListener ',item.params.key);
                    removeEventListener("load",onFrameLoad);
                }
            } else {
                if(isActive && locale !== lastLocale){
                    console.log('ChildFrame UPDATE_LOCALE ',item.params.key);
                    const url=parseUrl(item.params.url);
                    refFrame.current.contentWindow.postMessage({
                        type:FRAME_MESSAGE_TYPE.UPDATE_LOCALE,
                        i18n:{locale,resources}},url.origin);
                    setLastLocale(locale);
                }
            }
        }
    },[refFrame,item,locale,isActive,lastLocale,resources,setLastLocale]);

    const url=convertUrl(item.params.url);

    return locale?(
        <iframe           
            title={frameType+"_"+item.params.key} 
            id={frameType+"_"+item.params.key} 
            ref={refFrame} 
            frameBorder={0} 
            scrolling={"yes"} 
            src={url} />
    ):null;
}