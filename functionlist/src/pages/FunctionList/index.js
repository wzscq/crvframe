import { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";

import {FRAME_MESSAGE_TYPE,OP_TYPE} from '../../utils/constant';
import FunctionGroup from "./FunctionGroup";
import SearchBar from './SearchBar';

import './index.css';

const  GET_FUNCTION_URL="/definition/getUserFunction";

const opUpdateFrame={
    type:OP_TYPE.UPDATE_FRAME_DATA,
    params:{}
}

const opGetFunctonList={
    type:OP_TYPE.REQUEST,
    params:{
        url:GET_FUNCTION_URL,
        method:"post"
    },
    input:{},
    description:{key:'page.function.getFunctions',default:'获取功能列表'}
}

export default function FunctionList(props){
    const {origin,item}=useSelector(state=>state.frame);
    const {items:funcList}=useSelector(state=>state.function);
    const {sendMessageToParent}=props;

    const updateFunctionList=useCallback(()=>{
        if(origin&&item){
            opUpdateFrame.params={frameType:item.frameType,frameID:item.params.key,origin:origin};
            opGetFunctonList.successOperation=opUpdateFrame;
            const message={
                type:FRAME_MESSAGE_TYPE.DO_OPERATION,
                data:{
                    operationItem:opGetFunctonList
                }
            };
            sendMessageToParent(message);
        }
    },[origin,item,sendMessageToParent]);

    useEffect(()=>{
        updateFunctionList();
    },[updateFunctionList]);

    console.log("funcList",funcList);

    return (
        <div className="function-main">
            <SearchBar updateFunctionList={updateFunctionList}/>
            <FunctionGroup funcList={funcList} sendMessageToParent={sendMessageToParent} />           
        </div>
    )
}