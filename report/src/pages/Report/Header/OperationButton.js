import React,{useState,useEffect} from 'react';
import {Button,Popconfirm} from 'antd';

import I18nLabel from '../../../components/I18nLabel';
import {FRAME_MESSAGE_TYPE} from '../../../utils/constant';

export default function OperationButton({operation,sendMessageToParent}){
    //const [promptDisabled,setPromptDisabled]=useState(true);
    const [running,setRunning]=useState(false);
    const [count,setCount]=useState(0);
    
    const doOperation=(operation)=>{
        //查询数据请求
        const message={
            type:FRAME_MESSAGE_TYPE.DO_OPERATION,
            data:{
                operationItem:operation
            }
        }

        sendMessageToParent(message);
    }

    const handleOk=()=>{
        console.log("OperationButton handleOk");
        if(operation.autoRun){
            setRunning(!running);
            setCount(0);
        } else {
            console.log("OperationButton handleOk doOperation",operation);
            doOperation(operation);
            //setPromptDisabled(true);
        }
    }

    const handleCancel=()=>{
        //setPromptDisabled(true);
    }

    useEffect(()=>{
        if(running===true){
            setTimeout(()=>{
                doOperation(operation);
                setCount(count+1);
            },operation.autoRun.interval);
        }
    },[running,count]);

    return (
        <Popconfirm
            title={<I18nLabel label={operation.prompt}/>}
            disabled={operation.prompt===undefined}
            placement="bottomLeft"
            onConfirm={handleOk}
            onCancel={handleCancel}
            okText={<I18nLabel label={{key:'page.report.opreationPrompt.confirm',default:'确定'}}/>}
            cancelText={<I18nLabel label={{key:'page.report.opreationPrompt.cancel',default:'取消'}}/>}
        >
            <Button 
                onClick={()=>operation.prompt===undefined?handleOk():null} 
                type={running?"default":"primary"}>
                <I18nLabel label={operation.name}/>
            </Button>
        </Popconfirm>
    )
}