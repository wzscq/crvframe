import { useEffect, useState } from "react";
import { Popconfirm,Button } from "antd";

import I18nLabel from "../I18nLabel";

export default function OperationButton({type,operation,doOperation,disabled}){
    //const [promptDisabled,setPromptDisabled]=useState(true);
    const [running,setRunning]=useState(false);
    const [count,setCount]=useState(0);
    
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

    console.log("OperationButton",operation.prompt);

    return (
        <Popconfirm
            title={<I18nLabel label={operation.prompt}/>}
            disabled={operation.prompt===undefined||disabled===true}
            onConfirm={handleOk}
            onCancel={handleCancel}
            okText={<I18nLabel label={{key:'page.crvlistview.opreationPrompt.confirm',default:'确定'}}/>}
            cancelText={<I18nLabel label={{key:'page.crvlistview.opreationPrompt.cancel',default:'取消'}}/>}
        >
            <Button 
                disabled={disabled}
                onClick={()=>operation.prompt===undefined?handleOk():null} 
                type={running?"":type}>
                <I18nLabel label={operation.name}/>
            </Button>
        </Popconfirm>
    )
}