import {useCallback} from 'react';
import { Space,message,Dropdown,Button } from "antd";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import dayjs from 'dayjs';
import { MoreOutlined } from '@ant-design/icons';

import {FRAME_MESSAGE_TYPE} from '../../../utils/constant';
import OperationButton from '../../../components/OperationButton';
import useI18n from '../../../hooks/useI18n';
import {
    getListOperationPreporcessFunc
} from '../../../utils/functions';

import './index.css';

export default function ListOperationBar({sendMessageToParent}){
    const {currentView} = useSelector(state=>state.data);
    const {getLocaleLabel}=useI18n();
    const {fields,views,modelID,operations}=useSelector(state=>state.definition);
    const {selectedRowKeys,filter,pagination,sorter,selectAll}=useSelector(state=>state.data.views[state.data.currentView].data);

    const {searchFields,filterData,viewFilter}=useMemo(()=>{
        let searchFields=[];
        const viewConf=views.find(item=>item.viewID===currentView);
        if(viewConf&&viewConf.fields){
            viewConf.fields.forEach((fieldItem,index) => {
                const fieldConf=fields.find(item=>item.field===fieldItem.field);
                if(fieldConf){
                    const searchField={
                        field:fieldItem.field,
                        dataType:fieldConf.dataType,
                        fieldType:fieldConf.fieldType,
                        relatedModelID:fieldConf.relatedModelID,
                        relatedField:fieldConf.relatedField,
                        associationModelID:fieldConf.associationModelID,
                        fields:fieldItem.fields,
                        pagination:fieldItem.pagination,
                    }
                    searchFields.push(searchField);
                }
            });
        }

        return {searchFields,filterData:viewConf?.filterData,viewFilter:viewConf.filter}
    },[currentView]);

    const doOperation=useCallback((opItem)=>{
        if(opItem.selectedRows){
            console.log('selectedRows',selectedRowKeys,opItem,selectAll)
            if(selectedRowKeys.length>0){
                if(opItem.selectedRows?.min>selectedRowKeys.length){
                    message.info(getLocaleLabel(opItem.selectedRows.prompt));
                    return;
                }

                if(opItem.selectedRows?.max<selectedRowKeys.length){
                    message.info(getLocaleLabel(opItem.selectedRows.prompt));
                    return;
                }
            } else {
                if(opItem.selectedRows?.selectAll!==true||selectAll!==true){
                    message.info(getLocaleLabel(opItem.selectedRows.prompt));
                    return;
                }
            }
        }
        
        let operation=operations.find(element=>element.id===opItem.operationID);
        if(operation){
            let queryFilter=filter;
            if(viewFilter&&Object.keys(viewFilter).length>0){
                if(Object.keys(filter).length>0){
                    queryFilter={
                        'Op.and':[filter,viewFilter]
                    };
                } else {
                    queryFilter=viewFilter;
                }
            }

            //由于行的ID可能是一个引用字段，所以这里需要对selectedRowKeys做一个检查和变换
            const selectedRowIDs=selectedRowKeys.map(item=>{
                if(item.value){
                    return item.value;
                }
                return item;
            });

            const input={
                modelID:modelID,
                viewID:currentView,
                selectedRowKeys:selectedRowIDs,
                filter:queryFilter,
                filterData:filterData,
                pagination:pagination,
                sorter:sorter,
                fields:searchFields,
                selectedAll:selectAll
            };

            //对operation做预处理，一般是基于数据行为operaiton增加过滤条件
            if(operation&&opItem.preprocessing){
                //console.log('preprocessing',opItem.preprocessing);
                operation=getListOperationPreporcessFunc(opItem.preprocessing)(operation,input,dayjs);
                //console.log('preprocessing',operation);
            }

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
    },[operations,currentView,modelID,getLocaleLabel,viewFilter,selectAll,selectedRowKeys,filter,filterData,pagination,sorter,searchFields,sendMessageToParent]);


    const getDropDownItems=(items,operations)=>{
        return items.map(item=>{
            if(item.children){
                const childItems=getDropDownItems(item.children,operations);
                if(childItems.length>0){
                    return {
                        key: item.operationID,
                        label: <Button type='link'>{getLocaleLabel(item.name)}</Button>,
                        children:getDropDownItems(item.children,operations)
                    }
                }
            } else {
                const operation=operations.find(element=>element.id===item.operationID);
                if(operation){
                    return {
                        key: item.operationID,
                        label: <OperationButton key={item.operationID} type='link' doOperation={doOperation} operation={{name:operation.name,...item}}/>
                    }
                }
            }
            return null;
        }).filter(item=>item!==null);
    }

    const buttonControls=useMemo(()=>{
        let buttonControls=[];
        let hideItems=[];
        const viewConf=views.find(item=>item.viewID===currentView);
        if(viewConf){
            const listToolbar=viewConf.toolbar?.listToolbar;
            if(listToolbar){
                const {showCount,buttons}=listToolbar;
                if(buttons){
                    let buttonCount=0;
                    for(let i=0;i<buttons.length;++i){
                        const item=buttons[i];
                        if(item.children){
                            if(buttonCount<showCount){
                                const items=getDropDownItems(item.children,operations);
                                if(items.length>0){
                                    buttonCount++;
                                    buttonControls.push(
                                        <Dropdown menu={{items:items}}>
                                            <Button type='primary'>{getLocaleLabel(item.name)}<MoreOutlined/></Button>
                                        </Dropdown>
                                    );
                                }
                            } else {
                                hideItems.push(item)
                            }
                        } else {
                            const operation=operations.find(element=>element.id===item.operationID);
                            if(operation){
                                if(buttonCount<showCount){
                                    buttonCount++;
                                    buttonControls.push(
                                        <OperationButton key={item.operationID} type='primary' doOperation={doOperation} operation={{name:operation.name,...item}}/>
                                    );
                                } else {
                                    hideItems.push(item)
                                }
                            }
                        }
                    }
                }
            }
        }

        if(hideItems.length>0){
            const dropdownItems=getDropDownItems(hideItems,operations);
            if(dropdownItems.length>0){
                buttonControls.push(
                    <Dropdown menu={{items:dropdownItems}}>
                        <Button type='primary'>{getLocaleLabel({key:'page.crvlistview.moreOperation',default:'更多操作'})}<MoreOutlined/></Button>
                    </Dropdown>
                )
            }
        }

        return buttonControls;
    },[currentView,operations,doOperation]);

    return (
        <div className="list-operation-bar">
            <Space >
                {buttonControls}
            </Space>
        </div>
    );
}