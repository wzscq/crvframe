import { useEffect, useState } from "react";
import { Popconfirm,Button } from "antd";

import I18nLabel from "../I18nLabel";

export default function OperationButton({type,operation,doOperation,disabled}){
    const [promptDisabled,setPromptDisabled]=useState(true);
    const [running,setRunning]=useState(false);
    const [count,setCount]=useState(0);
    
    const handleOk=()=>{
        if(operation.autoRun){
            setRunning(!running);
            setCount(0);
        } else {
            doOperation(operation);
            setPromptDisabled(true);
        }
    }

    const handleCancel=()=>{
        setPromptDisabled(true);
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
            open={!promptDisabled}
            onConfirm={handleOk}
            onCancel={handleCancel}
            okText={<I18nLabel label={{key:'page.crvlistview.opreationPrompt.confirm',default:'确定'}}/>}
            cancelText={<I18nLabel label={{key:'page.crvlistview.opreationPrompt.cancel',default:'取消'}}/>}
        >
            <Button 
                disabled={disabled}
                onClick={()=>operation.prompt?setPromptDisabled(false):handleOk()} 
                type={running?"":type}>
                <I18nLabel label={operation.name}/>
            </Button>
        </Popconfirm>
    )
}