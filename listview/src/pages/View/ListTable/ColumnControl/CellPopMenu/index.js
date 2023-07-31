import { Space } from 'antd';
import { useCallback,useMemo } from "react"
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import OperationButton from '../../../../../components/OperationButton';
import {FRAME_MESSAGE_TYPE} from '../../../../../utils/constant';
import {
    getOperationPreporcessFunc,
    getRowButtonDisabledFunc
} from '../../../../../utils/functions';

import './index.css';

export default function CellOperationBar({sendMessageToParent,cellPopMenu, record, index}){

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
            //这里的ID也有可能是一个关联字段，所以要判断一下
            let id=record['id'];
            if(id.value){
                id=id.value;
            }

            const message={
                type:FRAME_MESSAGE_TYPE.DO_OPERATION,
                data:{
                    operationItem:{
                        ...operation,
                        input:{
                            modelID:modelID,
                            selectedRowKeys:[id],
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
        
        for(let i=0;i<cellPopMenu.buttons.length;++i){
            const item=cellPopMenu.buttons[i];
            const operation=operations.find(element=>element.id===item.operationID);
            if(operation){
                let disabled=false;
                if(item.disabled){
                    disabled=getRowButtonDisabledFunc(item.disabled)(record);
                }
                buttonControls.push(
                    <OperationButton disabled={disabled}  key={item.operationID} type='link' doOperation={doOperation} operation={{name:operation.name,...item}}/>
                );
            }
        }
            
        return buttonControls;
    },[cellPopMenu,operations,doOperation]);

  return (
    <Space className='cell-pop-menu'  direction="vertical" size="small" style={{ display: 'flex' }}>
      {buttonControls}
    </Space>
  );
}