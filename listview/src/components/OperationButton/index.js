import { useState } from "react";
import { Popconfirm,Button } from "antd";

import I18nLabel from "../I18nLabel";

export default function OperationButton({type,operation,doOperation,disabled}){
    const [promptDisabled,setPromptDisabled]=useState(true);

    const handleOk=()=>{
        doOperation(operation);
        setPromptDisabled(true);
    }

    const handleCancel=()=>{
        setPromptDisabled(true);
    }

    return (
        <Popconfirm
            title={<I18nLabel label={operation.prompt}/>}
            disabled={promptDisabled}
            onConfirm={handleOk}
            onCancel={handleCancel}
            okText={<I18nLabel label={{key:'page.crvlistview.opreationPrompt.confirm',default:'确定'}}/>}
            cancelText={<I18nLabel label={{key:'page.crvlistview.opreationPrompt.cancel',default:'取消'}}/>}
        >
            <Button 
                disabled={disabled}
                onClick={()=>operation.prompt?setPromptDisabled(false):doOperation(operation)} 
                type={type}>
                <I18nLabel label={operation.name}/>
            </Button>
        </Popconfirm>
    )
}