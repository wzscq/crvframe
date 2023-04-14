import { useEffect,useCallback } from 'react';
import {useSelector,useDispatch} from 'react-redux';

import {setParam} from '../redux/frameSlice';
import { setDefinition } from '../redux/definitionSlice';
import {setData,refreshData} from '../redux/dataSlice';
import {setLocale} from '../redux/i18nSlice';

import {
    FRAME_MESSAGE_TYPE,
    DATA_TYPE
} from '../utils/constant';

const getParentOrigin=()=>{
    const a = document.createElement("a");
    a.href=document.referrer;
    return a.origin;
}

export default function useFrame(){
    const dispatch=useDispatch();
    const {origin}=useSelector(state=>state.frame);
    const {forms} = useSelector(state=>state.definition);

    console.log("formview useframe",origin);

    const sendMessageToParent=useCallback((message)=>{
        if(origin){
            window.parent.postMessage(message,origin);
        } else {
            console.log("the origin of parent is null,can not send message to parent.");
        }
    },[origin]);
        
    //这里在主框架窗口中挂载事件监听函数，负责和子窗口之间的操作交互
    const receiveMessageFromMainFrame=useCallback((event)=>{
        console.log("crv_form receiveMessageFromMainFrame:",event);
        const {type,dataType,data}=event.data;
        if(type===FRAME_MESSAGE_TYPE.INIT){
            dispatch(setParam({origin:event.origin,item:event.data.data}));
            if(event.data.i18n){
                dispatch(setLocale(event.data.i18n));
            }
        } else if (type===FRAME_MESSAGE_TYPE.UPDATE_DATA){
            console.log("UPDATE_DATA",event.data)
            if(dataType===DATA_TYPE.MODEL_CONF){
                dispatch(setDefinition(data));
            } else if (dataType===DATA_TYPE.QUERY_RESULT){
                dispatch(setData({data,controls:forms[0].controls}));
            } else {
                console.log("update data with wrong data type:",dataType);
            }
        } else if (type===FRAME_MESSAGE_TYPE.RELOAD_DATA){
            console.log("reload data");
            dispatch(refreshData());
        } else if (type===FRAME_MESSAGE_TYPE.UPDATE_LOCALE){
            console.log("UPDATE_LOCALE",event.data)
            //dispatch(setLocale(event.data.i18n));
        }
    },[dispatch,forms]);
        
    useEffect(()=>{
        window.addEventListener("message",receiveMessageFromMainFrame);
        return ()=>{
            window.removeEventListener("message",receiveMessageFromMainFrame);
        }
    },[receiveMessageFromMainFrame]);

    useEffect(()=>{
        if(origin===null){
            setTimeout(()=>{
                console.log('postMessage to parent init');
                window.parent.postMessage({type:FRAME_MESSAGE_TYPE.INIT},getParentOrigin());
            },200);
        }
    },[origin]);

    return sendMessageToParent;
}