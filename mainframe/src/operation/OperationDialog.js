import { useEffect } from "react"; 
import { useDispatch, useSelector} from "react-redux";
import { Modal,Button,message} from 'antd';
import { useNavigate } from "react-router-dom";

import {
    requestAction,
    downloadAction,
    logoutApi,
    queryData,
    queryReportData,
    getImage
} from '../api';

import {createLogoutOperation} from './operationItemFactory';
import {open,close} from '../redux/dialogSlice';
import {
    setOperation,
    operationDone,
    operationPending,
    doNextOperation,
    confirm} from '../redux/operationSlice';
import {openTab,closeAllTab,setActiveTab} from '../redux/tabSlice';
import {resetMenu} from '../redux/menuSlice';
import OpertaionItem from './OpertaionItem';
import {info as logInfo} from '../redux/logSlice';
import {parseUrl} from '../utils/urlParser';
import {userInfoStorage} from '../utils/sessionStorage';

import {
    OP_TYPE,
    OP_RESULT,
    OPEN_LOCATION,
    FRAME_MESSAGE_TYPE,
    MESSAGE_TYPE,
    DATA_TYPE,
    ERROR_CODE
} from "./constant";
import useI18n from "../hook/useI18n";

export default function OperationDialog(){
    const {getLocaleLabel,getLocaleErrorMessage}=useI18n();
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const {doneList,current,needConfirm,queen}=useSelector(state=>state.operation);
    const {pending,error,result:requestResult,message:resultMessage,params:resultParams,errorCode}=useSelector(state=>state.request);
    const {current:currentTab,items:tabItems}=useSelector(state=>state.tab);

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
        dispatch(resetMenu());
        dispatch(close());
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
        let item=tabItems.find((item)=>item.params.key===current.params.key);
        if(!item){  //如果页面未打开则直接打开
            dispatch(openTab({params:current.params,input:current.input}));
        } else {
            //如果已经打开,但不是当前窗口，则将其设置为当前激活tab
            if(currentTab!==current.params.key){
                dispatch(setActiveTab(current.params.key));
            }
            //如果指定了视图，则发送更新当前视图消息
            const frameControl=document.getElementById("tabframe_"+current.params.key);
            if(frameControl){
                const origin=parseUrl(frameControl.getAttribute("src")).origin;
                const message={
                        type:FRAME_MESSAGE_TYPE.UPDATE_DATA,
                        dataType:DATA_TYPE.FRAME_PARAMS,
                        data:current.params,
                        input:current.input
                    };
                frameControl.contentWindow.postMessage(message,origin);
            }        
        }
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
                dispatch(logInfo("下载完成:"+JSON.stringify({error,errorCode,resultMessage,requestResult,resultParams})));
                const payload={
                    result:error?OP_RESULT.ERROR:OP_RESULT.SUCCESS,
                    output:requestResult,
                    error:error,
                    errorCode:errorCode,
                    message:resultMessage,
                    resultParams:resultParams
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
                    responseType:current.params.responseType,
                    data:current.input
                }
                dispatch(requestAction(params));
                dispatch(operationPending(true));
            } else {
                //执行完成
                dispatch(logInfo("请求执行完成:"+JSON.stringify({error,errorCode,resultMessage,requestResult,resultParams})));
                const payload={
                    result:error?OP_RESULT.ERROR:OP_RESULT.SUCCESS,
                    output:requestResult,
                    error:error,
                    errorCode:errorCode,
                    message:resultMessage,
                    resultParams:resultParams
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

    useEffect(()=>{
        const errorCallback=(error)=>{
            console.log('errorCallback:'+JSON.stringify(error));       
            message.error(error.message);
            if(error.errorCode===ERROR_CODE.TOKEN_EXPIRED){
                dispatch(setOperation(createLogoutOperation()));
            }
        }
    
        //这里在主框架窗口中挂载事件监听函数，负责和子窗口之间的操作交互
        const receiveMessageFromSubFrame=(event)=>{
            console.log('data.operationItem:'+JSON.stringify(event.data));
            const {type,data}=event.data;
            
            dispatch(logInfo('receiveMessageFromSubFrame:'+JSON.stringify(event.data)));
           
            if(type===FRAME_MESSAGE_TYPE.DO_OPERATION){
                if(runing===true){
                    if(data.operationItem.queenable!==true){
                        console.log('data.operationItem',data?.operationItem)
                        message.warning(getLocaleLabel({key:'message.main.hasOperationWhenSet',default:'当前操作尚未执行完成，请稍后再试！'}));
                        return;
                    }
                }
                dispatch(logInfo('do_operation:'+JSON.stringify(data.operationItem)));
                dispatch(setOperation(data.operationItem));
            } else if (type===FRAME_MESSAGE_TYPE.QUERY_REQUEST) {
                queryData(data,errorCallback);
            } else if (type===FRAME_MESSAGE_TYPE.REPORT_QUERY){
                queryReportData(data,errorCallback);
            } else if (type===FRAME_MESSAGE_TYPE.GET_IMAGE) {
                console.log('wzstest get image');
                getImage(data,errorCallback);
            } else {
                console.log('not supported frame message type:'+type);
            }
        }

        window.addEventListener('message',receiveMessageFromSubFrame);
        return ()=>{
            window.removeEventListener('message',receiveMessageFromSubFrame);
        }
    },[runing,dispatch,getLocaleLabel]);


    //这里处理队列中的操作
    useEffect(()=>{
        //如果当前没有正在执行的操作
        console.log("wzstest",queen,needConfirm,current);
        if(queen.length>0&&needConfirm===false&&current===undefined){
            dispatch(doNextOperation());
        }   
    },[queen,needConfirm,current,dispatch]);

    return (
        needConfirm?(<Modal 
            title={getLocaleLabel({key:'dialog.operation.doOperations',default:'执行操作'})} 
            zIndex={200} 
            visible={true} 
            closable={false}
            footer={footer}>
            {operationList}
        </Modal>):null
    );
}