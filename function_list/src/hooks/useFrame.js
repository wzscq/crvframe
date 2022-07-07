import { useEffect,useCallback } from "react";
import {useSelector,useDispatch} from 'react-redux';
import {setParam} from '../redux/frameSlice';
import { setFunction } from "../redux/functionSlice";
import { setLocale } from "../redux/i18nSlice";
import {FRAME_MESSAGE_TYPE} from '../utils/constant';

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
        console.log("receiveMessageFromMainFrame:",event);
        if(event.data.type===FRAME_MESSAGE_TYPE.INIT){
            dispatch(setParam({origin:event.origin,item:event.data.data}));
            if(event.data.i18n){
                dispatch(setLocale(event.data.i18n));
            }
        } else if (event.data.type===FRAME_MESSAGE_TYPE.UPDATE_DATA){
            console.log("UPDATE_DATA",event.data)
            dispatch(setFunction(event.data.data));
        } else if (event.data.type===FRAME_MESSAGE_TYPE.UPDATE_LOCALE){
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