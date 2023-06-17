import { Space } from "antd"
import { useCallback,useMemo } from "react"
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {FRAME_MESSAGE_TYPE} from '../../../utils/constant';
import {
    getRowButtonDisabledFunc,
    getOperationPreporcessFunc
} from '../../../utils/functions';

import OperationButton from '../../../components/OperationButton';

import './index.css';

export default function RowOperationBar({sendMessageToParent,record,showCount,buttons}){
    const {modelID}=useParams();
    const {operations} = useSelector(state=>state.definition);

    const doOperation=useCallback((opItem)=>{
        let operation=operations.find(element=>element.id===opItem.operationID);

        //对operation做预处理，一般是基于数据行为operaiton增加过滤条件
        if(operation&&opItem.preprocessing){
            console.log('preprocessing',opItem.preprocessing);
            operation=getOperationPreporcessFunc(opItem.preprocessing)(operation,record);
        }

        if(operation){
            const message={
                type:FRAME_MESSAGE_TYPE.DO_OPERATION,
                data:{
                    operationItem:{
                        ...operation,
                        input:{
                            modelID:modelID,
                            selectedRowKeys:[record['id']],
                            ...operation.input
                        }
                    }
                }
            };
            sendMessageToParent(message);
        }
    },[modelID,operations,sendMessageToParent,record]);

    const buttonControls=useMemo(()=>{
        let buttonControls=[];
        
        for(let i=0;i<buttons.length&&i<showCount;++i){
            const item=buttons[i];
            const operation=operations.find(element=>element.id===item.operationID);
            if(operation){
                let disabled=false;
                if(item.disabled){
                    disabled=getRowButtonDisabledFunc(item.disabled)(record);
                }

                buttonControls.push(
                    <OperationButton disabled={disabled} key={item.operationID} type='link' doOperation={doOperation} operation={{name:operation.name,...item}}/>
                );
            }
        }
            
        return buttonControls;
    },[buttons,operations,showCount,doOperation]);
    
    return (
        <Space className="row-operation-bar" size={5}>
        {buttonControls}
        </Space>
    )
}