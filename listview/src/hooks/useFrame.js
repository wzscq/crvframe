import { useEffect,useCallback } from "react";
import {useSelector,useDispatch} from 'react-redux';

import {setParam} from '../redux/frameSlice';
import { setDefinition } from '../redux/definitionSlice';
import {setData,refreshData} from '../redux/dataSlice';
import {setLocale} from '../redux/i18nSlice';

import {FRAME_MESSAGE_TYPE,DATA_TYPE} from '../utils/constant';

export default function useFrame(){
    const dispatch=useDispatch();
    const {origin}=useSelector(state=>state.frame);

    const sendMessageToParent=useCallback((message)=>{
        if(origin){
            window.parent.postMessage(message,origin);
        } else {
            console.log("the origin of parent is null,can not send message to parent.");
        }
    },[origin]);
        
    //这里在主框架窗口中挂载事件监听函数，负责和子窗口之间的操作交互
    const receiveMessageFromMainFrame=useCallback((event)=>{
        //console.log("receiveMessageFromMainFrame:",event);
        const {type,dataType,data}=event.data;
        if(type===FRAME_MESSAGE_TYPE.INIT){
            dispatch(setParam({origin:event.origin,item:data}));
            if(event.data.i18n){
                dispatch(setLocale(event.data.i18n));
            }
        } else if (type===FRAME_MESSAGE_TYPE.UPDATE_DATA){
            if(dataType===DATA_TYPE.MODEL_CONF){
                dispatch(setDefinition(data));
            } else if (dataType===DATA_TYPE.QUERY_RESULT){
                dispatch(setData(data));
            } else {
                console.log("update data with wrong data type:",dataType);
            }
        }  else if (type===FRAME_MESSAGE_TYPE.RELOAD_DATA){
            dispatch(refreshData());
        } else if (type===FRAME_MESSAGE_TYPE.UPDATE_LOCALE){
            console.log("UPDATE_LOCALE",event.data)
            dispatch(setLocale(event.data.i18n));
        }
    },[dispatch]);
        
    useEffect(()=>{
        window.addEventListener("message",receiveMessageFromMainFrame);
        return ()=>{
            window.removeEventListener("message",receiveMessageFromMainFrame);
        }
    });

    return sendMessageToParent;
}