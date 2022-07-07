import {useCallback} from 'react';
import { Space } from "antd";
import { useMemo } from "react";
import { useSelector } from "react-redux"

import {FRAME_MESSAGE_TYPE} from '../../../utils/constant';
import OperationButton from '../../../components/OperationButton';

import './index.css';

export default function ListOperationBar({sendMessageToParent}){
    const {currentView} = useSelector(state=>state.data);
    const {fields,views,modelID,operations}=useSelector(state=>state.definition);
    const {selectedRowKeys,filter,pagination,sorter}=useSelector(state=>state.data.views[state.data.currentView].data);

    const searchFields=useMemo(()=>{
        let searchFields=[];
        const viewConf=views.find(item=>item.viewID===currentView);
        if(viewConf&&viewConf.fields){
            viewConf.fields.forEach((fieldItem,index) => {
                const fieldConf=fields.find(item=>item.field===fieldItem.field);
                if(fieldConf){
                    searchFields.push({field:fieldItem.field,dataType:fieldConf.dataType});
                }
            });
        }
        return searchFields
    },[fields,currentView,views]);

    const doOperation=useCallback((opItem)=>{
        const operation=operations.find(element=>element.id===opItem.operationID);
        if(operation){
            const input={
                modelID:modelID,
                viewID:currentView,
                selectedRowKeys:selectedRowKeys,
                filter:filter,
                pagination:pagination,
                sorter:sorter,
                fields:searchFields
            };

            const message={
                type:FRAME_MESSAGE_TYPE.DO_OPERATION,
                data:{
                    operationItem:{
                        ...operation,
                        input:{...input,...operation.input}
                    }
                }
            };
            sendMessageToParent(message);
        }
    },[operations,currentView,modelID,selectedRowKeys,filter,pagination,sorter,searchFields,sendMessageToParent]);

    const buttonControls=useMemo(()=>{
        let buttonControls=[];
        const viewConf=views.find(item=>item.viewID===currentView);
        if(viewConf){
            const listToolbar=viewConf.toolbar?.listToolbar;
            if(listToolbar){
                const {showCount,buttons}=listToolbar;
                if(buttons){
                    for(let i=0;i<buttons.length&&i<showCount;++i){
                        const item=buttons[i];
                        const operation=operations.find(element=>element.id===item.operationID);
                        if(operation){
                            buttonControls.push(
                                <OperationButton key={item.operationID} type='primary' doOperation={doOperation} operation={{name:operation.name,...item}}/>
                            );
                        }
                    }
                }
            }
        }
        return buttonControls;
    },[currentView,operations,views,doOperation]);

    return (
        <div className="list-operation-bar">
            <Space>
                {buttonControls}
            </Space>
        </div>
    )
}