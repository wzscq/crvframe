import { useEffect } from "react";
import { useDispatch } from 'react-redux';

import {info as logInfo} from '../../redux/logSlice';
import { 
    setOperation,
    FRAME_MESSAGE_TYPE } from '../../operation';
import Dialog from '../../dialog';
import FrameHeader from './FrameHeader';
import FrameTab from './FrameTab';
import {
    queryData,
    getAppIcon,
    getImage
} from '../../api';
import {userInfoStorage} from '../../utils/sessionStorage';
import './index.css';

export default function MainFrame(){   
    const dispatch=useDispatch();
    //这里在主框架窗口中挂载事件监听函数，负责和子窗口之间的操作交互
    const receiveMessageFromSubFrame=(event)=>{
        dispatch(logInfo('receiveMessageFromSubFrame:'+JSON.stringify(event.data)));
        const {type,data}=event.data;
        if(type===FRAME_MESSAGE_TYPE.DO_OPERATION){
            dispatch(logInfo('do_operation:'+JSON.stringify(event.data.data.operationItem)));
            setOperation(data.operationItem);
        } else if (type===FRAME_MESSAGE_TYPE.QUERY_REQUEST) {
            queryData(data);
        } else if (type===FRAME_MESSAGE_TYPE.GET_IMAGE) {
            getImage(data);
        }
    }

    useEffect(()=>{
        window.addEventListener('message',receiveMessageFromSubFrame);
        return ()=>{
            window.removeEventListener('message',receiveMessageFromSubFrame);
        }
    });

    useEffect(()=>{
        const {appID}=userInfoStorage.get();
        document.title=appID;
        let favicon = document.querySelector('link[rel="icon"]');
        if (favicon !== null) {
            console.log("set app icon to:",getAppIcon(appID));
            favicon.href = getAppIcon(appID);
        }
    });

    return (
        <div className="main-frame">
            <FrameHeader/>
            <FrameTab />
            <Dialog/>
        </div>
    )
}