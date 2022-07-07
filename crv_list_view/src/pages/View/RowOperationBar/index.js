import { Space } from "antd"
import { useCallback,useMemo } from "react"
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {FRAME_MESSAGE_TYPE} from '../../../utils/constant';
import OperationButton from '../../../components/OperationButton';

import './index.css';

export default function RowOperationBar({sendMessageToParent,record,showCount,buttons}){
    const {modelID}=useParams();
    const {operations} = useSelector(state=>state.definition);

    const doOperation=useCallback((opItem)=>{
        const operation=operations.find(element=>element.id===opItem.operationID);
        if(operation){
            const message={
                type:FRAME_MESSAGE_TYPE.DO_OPERATION,
                data:{
                    operationItem:{
                        ...operation,
                        input:{
                            modelID:modelID,
                            selectedRowKeys:[record['id']]
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
                buttonControls.push(
                    <OperationButton key={item.operationID} type='link' doOperation={doOperation} operation={{name:operation.name,...item}}/>
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