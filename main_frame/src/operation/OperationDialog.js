import { useEffect } from "react"; 
import { useDispatch, useSelector} from "react-redux";
import { Modal,Button,message} from 'antd';
import { useNavigate } from "react-router-dom";
import { SyncOutlined } from '@ant-design/icons';

import {
    requestAction,
    downloadAction,
    logoutApi
} from '../api';

import {open,close} from '../redux/dialogSlice';
import {operationDone,operationPending,confirm} from '../redux/operationSlice';
import {openTab,closeAllTab} from '../redux/tabSlice';
import OpertaionItem from './OpertaionItem';
import {info as logInfo} from '../redux/logSlice';
import {parseUrl} from '../utils/urlParser';
import {userInfoStorage} from '../utils/sessionStorage';

import {
    OP_TYPE,
    OP_RESULT,
    OPEN_LOCATION,
    FRAME_MESSAGE_TYPE,
    MESSAGE_TYPE
} from "./constant";
import useI18n from "../hook/useI18n";

export default function OperationDialog(){
    const {getLocaleLabel,getLocaleErrorMessage}=useI18n();
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const {doneList,current,needConfirm}=useSelector(state=>state.operation);
    const {pending,error,result:requestResult,message:resultMessage,errorCode}=useSelector(state=>state.request);
    
    //已完成操作列表
    const operationList=doneList.map((item,index)=>{
        return <OpertaionItem
                    getLocaleLabel={getLocaleLabel} 
                    getLocaleErrorMessage={getLocaleErrorMessage}
                    key={index} 
                    item={item} 
                    state={2}/>;
    });

    const handleConfirm=()=>{
        dispatch(confirm());
    }

    const doLogout=()=>{
        const {appID}=userInfoStorage.get();
        dispatch(operationDone({result:OP_RESULT.SUCCESS}));
        dispatch(logoutApi());
        dispatch(closeAllTab());
        navigate('/login/'+appID);
    }

    const showMessage=()=>{
        const {type,content,duration}=current.params;
        if(type===MESSAGE_TYPE.SUCCESS){
            message.success(getLocaleLabel(content),duration);
        } else if (type===MESSAGE_TYPE.ERROR){
            message.error(getLocaleLabel(content),duration);
        } else {
            message.info(getLocaleLabel(content),duration);
        }
        dispatch(operationDone({result:OP_RESULT.SUCCESS}));
    }

    const openDialog=()=>{
        dispatch(logInfo("打开对话框:"+JSON.stringify(current)));
        //打开对话框，同时结束当前动作
        dispatch(open({params:current.params,input:current.input}));
        dispatch(operationDone({result:OP_RESULT.SUCCESS}));
    }

    const closeDialog=(current)=>{
        //关闭对话框，同时结束当前动作
        dispatch(logInfo("关闭对话框:"+JSON.stringify(current)));
        dispatch(close());
        const payload={
            result:OP_RESULT.SUCCESS,
            output:current.input,
        }
        dispatch(operationDone(payload));
    }

    const openTabFunc=()=>{
        //打开tab页
        dispatch(logInfo("打开Tab页:"+JSON.stringify(current)));
        dispatch(openTab({params:current.params}));
        dispatch(operationDone({result:OP_RESULT.SUCCESS}));
    }

    const downloadFile=()=>{
        if(pending===false){
            if(current.params.pending!==true){
                dispatch(logInfo("发出请求:"+JSON.stringify(current)));
                //开始发出请求
                const params={
                    data:current.input,
                    fileName:current.params.fileName
                }
                dispatch(downloadAction(params));
                dispatch(operationPending(true));
            } else {
                //执行完成
                dispatch(logInfo("下载完成:"+JSON.stringify({error,errorCode,resultMessage,requestResult})));
                const payload={
                    result:error?OP_RESULT.ERROR:OP_RESULT.SUCCESS,
                    output:requestResult,
                    error:error,
                    errorCode:errorCode,
                    message:resultMessage
                }
                dispatch(operationDone(payload));
            }
        } else {
            //执行中
            dispatch(logInfo("下载执行中"));
        }
    }

    const doRequest=()=>{
        if(pending===false){
            if(current.params.pending!==true){
                dispatch(logInfo("发出请求:"+JSON.stringify(current)));
                //开始发出请求
                const params={
                    url:current.params.url,
                    method:current.params.method,
                    data:current.input
                }
                dispatch(requestAction(params));
                dispatch(operationPending(true));
            } else {
                //执行完成
                dispatch(logInfo("请求执行完成:"+JSON.stringify({error,errorCode,resultMessage,requestResult})));
                const payload={
                    result:error?OP_RESULT.ERROR:OP_RESULT.SUCCESS,
                    output:requestResult,
                    error:error,
                    errorCode:errorCode,
                    message:resultMessage
                }
                dispatch(operationDone(payload));
            }
        } else {
            //执行中
            dispatch(logInfo("请求执行中"));
        }
    }

    const updateFrameData=()=>{
        dispatch(logInfo("更新iframe数据:"+JSON.stringify(current)));
        const {frameID,frameType,dataType}=current.params;
        const frameControl=document.getElementById(frameType+"_"+frameID);
        if(frameControl){
            const origin=parseUrl(frameControl.getAttribute("src")).origin;
            frameControl.contentWindow.postMessage({type:FRAME_MESSAGE_TYPE.UPDATE_DATA,dataType:dataType,data:current.input},origin);
        }
        dispatch(operationDone({result:OP_RESULT.SUCCESS}));
    }

    const reloadFrameData=()=>{
        dispatch(logInfo("通知iframe从新加载数据:"+JSON.stringify(current)));
        const {key,location}=current.params;
        let frameType="tabframe";
        if(location===OPEN_LOCATION.MODAL){
            frameType="frameDialog";
        }
        console.log(frameType+"_"+key);
        const frameControl=document.getElementById(frameType+"_"+key);
        if(frameControl){
            console.log("send message to subframe");
            const origin=parseUrl(frameControl.getAttribute("src")).origin;
            frameControl.contentWindow.postMessage({type:FRAME_MESSAGE_TYPE.RELOAD_DATA,data:current.input},origin);
        }
        dispatch(operationDone({result:OP_RESULT.SUCCESS}));
    }

    //这里负责实际执行操作动作
    useEffect(()=>{
        if(current){
            if(current.type===OP_TYPE.OPEN){
                if(current.params.location===OPEN_LOCATION.MODAL){
                    openDialog(current);
                } else if(current.params.location===OPEN_LOCATION.TAB){
                    openTabFunc();
                } else {
                    dispatch(logInfo("打开窗口位置不正确:"+JSON.stringify(current)));
                }
            } else if(current.type===OP_TYPE.CLOSE){
                if(current.params.location===OPEN_LOCATION.MODAL){
                    closeDialog(current);
                } else {
                    dispatch(logInfo("关闭窗口的位置不正确:"+JSON.stringify(current)));
                }
            } else if(current.type===OP_TYPE.REQUEST){
                doRequest();
            } else if(current.type===OP_TYPE.UPDATE_FRAME_DATA){
                updateFrameData();
            } else if (current.type===OP_TYPE.RELOAD_FRAME_DATA){
                reloadFrameData();
            } else if (current.type===OP_TYPE.LOGOUT){
                doLogout();
            } else if (current.type===OP_TYPE.MESSAGE){
                showMessage();
            } else if (current.type===OP_TYPE.DOWNLOAD_FILE){
                downloadFile();
            } else {
                dispatch(logInfo("目前不支持的操作:"+JSON.stringify(current)));
            }
        }
    });
    
    let footer=null;
    let runing=false;
    if(current){
        //当前正在执行的操作放入列表中
        operationList.push(
            <OpertaionItem 
                getLocaleLabel={getLocaleLabel} 
                getLocaleErrorMessage={getLocaleErrorMessage}
                key={operationList.length} 
                item={current} 
                state={1}/>
        );
        runing=true;    
    } else {
        //所有的操作都执行完成，并且有错误，则需要用户确认
        if(needConfirm){
            footer=[
                <Button type="primary" onClick={handleConfirm}>{getLocaleLabel({key:'dialog.operation.confirm',default:'确定'})}</Button>,
            ]
        }
    }

    return (
        needConfirm?(<Modal 
            title={getLocaleLabel({key:'dialog.operation.doOperations',default:'执行操作'})} 
            zIndex={200} 
            visible={true} 
            closable={false}
            footer={footer}>
            {operationList}
        </Modal>):(<Button type="text" loading={runing} icon={<SyncOutlined/>}/>)
    )
}