import { useState } from "react";
import { Popconfirm,Button } from "antd";

import I18nLabel from "../I18nLabel";

export default function OperationButton({type,operation,doOperation}){
    const [promptVisible,setPromptVisible]=useState(false);

    const handleOk=()=>{
        doOperation(operation);
        setPromptVisible(false);
    }

    const handleCancel=()=>{
        setPromptVisible(false);
    }

    return (
        <Popconfirm
            title={<I18nLabel label={operation.prompt}/>}
            visible={promptVisible}
            onConfirm={handleOk}
            onCancel={handleCancel}
            okText={<I18nLabel label={{key:'page.crvlistview.opreationPrompt.confirm',default:'确定'}}/>}
            cancelText={<I18nLabel label={{key:'page.crvlistview.opreationPrompt.cancel',default:'取消'}}/>}
        >
            <Button 
                onClick={()=>operation.prompt?setPromptVisible(true):doOperation(operation)} 
                type={type}>
                <I18nLabel label={operation.name}/>
            </Button>
        </Popconfirm>
    )
}