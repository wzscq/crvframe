import { Table } from "antd";
import { useEffect, useMemo,useCallback } from "react";
import { useDispatch, useSelector, } from "react-redux";
import { useResizeDetector } from 'react-resize-detector';

import {setSelectedRowKeys} from '../../../redux/dataSlice';
import FilterDropdown from './FilterDropdown';
import FilterIcon from './FilterIcon';
import TableFooter from './TableFooter';

import {createQueryDataMessage} from '../../../utils/normalOperations';
import RowOperationBar from '../RowOperationBar';
import ColumnControl from "./ColumnControl";
import I18nLabel from "../../../components/I18nLabel";
import './index.css';

export default function ListTable({sendMessageToParent}){
    const dispatch=useDispatch();
    const { height,ref } = useResizeDetector();
    const {origin,item}=useSelector(state=>state.frame);
    const {currentView} = useSelector(state=>state.data);
    const {fields,views,modelID}=useSelector(state=>state.definition);
    const {selectedRowKeys,list,fixedColumn,filter,pagination,sorter}=useSelector(state=>state.data.views[state.data.currentView].data);

    const viewConf=useMemo(()=>{
        return views.find(item=>item.viewID===currentView);
    },[currentView,views]);

    //根据视图列配置生成列
    const getColumn=useCallback((field,index,isFixed)=>{
        const getCellStyleFunc=(cellStyle)=>{
            const funStr='"use strict";'+
                        'return (function(record, rowIndex){ '+
                            'try {'+
                                cellStyle+
                            '} catch(e) {'+
                            '   console.error(e);'+
                            '   return undefined;'+
                            '}'+
                        '})';
            return Function(funStr)();
        };

        return {
            dataIndex:field.field,
            title:<I18nLabel label={field.name}/>,
            filterDropdown:<FilterDropdown sendMessageToParent={sendMessageToParent} field={field} index={index}/>,
            filterIcon: <FilterIcon field={field}/>,
            width:field.width,
            fixed:(isFixed?'left':''),
            ellipsis: true,
            onCell:(record,rowIndex)=>{
                if(field.cellStyle){
                    const cellStyle=getCellStyleFunc(field.cellStyle)(record,rowIndex);
                    return {style:cellStyle};
                }        
            },
            render:(text, record, index)=>{
                return <ColumnControl text={text} field={field} record={record} index={index} />;
            }
        }
    },[sendMessageToParent]);

    const getOperationColumn=useCallback((rowToolbar)=>{
        const {showCount,buttons,width}=rowToolbar;
        return { 
            title: <I18nLabel label={{key:'page.crvlistview.operationColumnTitle',default:'操作'}}/>, 
            dataIndex: '__action',
            width: width,
            fixed:'left',
            render: (text, record, index) => <RowOperationBar 
                                                sendMessageToParent={sendMessageToParent}
                                                showCount={showCount} 
                                                buttons={buttons} 
                                                record={record}/>
        }
    },[sendMessageToParent]);
    
    const columns=useMemo(()=>{
        let columns=[];
        if(viewConf){
            const rowToolbar=viewConf.toolbar?.rowToolbar;
            if(rowToolbar){
                console.log('rowToolbar',rowToolbar);
                columns.push(getOperationColumn(rowToolbar));
            }
            if(viewConf.fields){
                viewConf.fields.forEach((fieldItem,index) => {
                    const fieldConf=fields.find(item=>item.field===fieldItem.field);
                    if(fieldConf){
                        columns.push(getColumn({...fieldConf,...fieldItem},index,fixedColumn>index)); 
                    }
                });
            }
        }
        return columns
    },[fields,viewConf,fixedColumn,getColumn,getOperationColumn]);

    const searchFields=useMemo(()=>{
        let searchFields=[];
        const viewConf=views.find(item=>item.viewID===currentView);
        if(viewConf&&viewConf.fields){
            viewConf.fields.forEach((fieldItem,index) => {
                const fieldConf=fields.find(item=>item.field===fieldItem.field);
                if(fieldConf){
                    let searchField={
                        field:fieldItem.field,
                        dataType:fieldConf.dataType
                    };
                    if(fieldItem.fields&&fieldItem.fields.length>0){
                        searchField={
                            field:fieldItem.field,
                            dataType:fieldConf.dataType,
                            fieldType:fieldConf.fieldType,
                            relatedModelID:fieldConf.relatedModelID,
                            relatedField:fieldConf.relatedField,
                            associationModelID:fieldConf.associationModelID,
                            fields:fieldItem.fields
                        }
                    }
                    searchFields.push(searchField);
                }
            });
        }
        return searchFields
    },[fields,currentView,views]);

    useEffect(()=>{
        if(item&&origin&&searchFields.length>0){
            const frameParams={frameType:item.frameType,frameID:item.params.key,origin:origin};
            const queryParams={modelID,viewID:currentView,filter,pagination,sorter,fields:searchFields};
            sendMessageToParent(createQueryDataMessage(frameParams,queryParams));
        }
    },[searchFields,filter,pagination,sorter,sendMessageToParent,origin,item,currentView,modelID]);

    //处理行的选中
    const onSelectChange=selectedRowKeys => {
        dispatch(setSelectedRowKeys(selectedRowKeys));
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    //处理行选中结束

    //可以通过公式控制row的背景色
    const onRow=useCallback((record, rowIndex)=>{
        console.log('onRow',viewConf.rowStyle);
        if(viewConf.rowStyle){
            const getRowStyleFunc=()=>{
                const funStr='"use strict";'+
                            'return (function(record, rowIndex){ '+
                                'try {'+
                                    viewConf.rowStyle+
                                '} catch(e) {'+
                                '   console.error(e);'+
                                '   return undefined;'+
                                '}'+
                            '})';
                return Function(funStr)();
            };

            const rst=getRowStyleFunc()(record, rowIndex);
            console.log('rowStyle:',rst);
            const rowStyle={
                style:{backgroundColor:'white',...rst}
            };
            return rowStyle
        }
        return ({
            style:{backgroundColor:'white'}
        });
    },[viewConf]);

    return (
        <div className="list-table">
            <Table 
                columns={columns} 
                dataSource={list} 
                size="small" 
                bordered 
                rowSelection={rowSelection}
                rowKey='id'
                footer={()=>(<TableFooter/>)}
                pagination={false}
                scroll={{ y: height-80 }}
                onRow={onRow}
            />
            <div ref={ref} style={{height:"100%",width:"100%"}}>{}</div>
        </div>
    )
}