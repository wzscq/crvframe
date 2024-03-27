/* eslint-disable no-new-func */
import { Table, Tooltip } from "antd";
import { useEffect, useMemo,useCallback } from "react";
import { useDispatch, useSelector, } from "react-redux";
import { useResizeDetector } from 'react-resize-detector';

import {setSelectedRowKeys} from '../../../redux/dataSlice';
import {setViewFieldWidth} from '../../../redux/definitionSlice';
import FilterDropdown from './FilterDropdown';
import FilterIcon from './FilterIcon';
import TableFooter from './TableFooter';

import {createQueryDataMessage} from '../../../utils/normalOperations';
import RowOperationBar from '../RowOperationBar';
import ColumnControl from "./ColumnControl";
import I18nLabel from "../../../components/I18nLabel";
import { formatStringNumber } from "../../../utils/functions";
import { FIELD_TYPE } from "../../../utils/constant";

import ResizableTitle from './ResizableTitle';

import './index.css';

export default function ListTable({sendMessageToParent}){
    const dispatch=useDispatch();
    const { height,ref } = useResizeDetector();
    const {origin,item}=useSelector(state=>state.frame);
    const {currentView} = useSelector(state=>state.data);
    const {fields,modelID,views}=useSelector(state=>state.definition);
    const {queryQueenable}=useSelector(state=>state.data);
    const {selectedRowKeys,list,summaries,fixedColumn,filter,pagination,sorter}=useSelector(state=>state.data.views[state.data.currentView].data);

    const viewConf=useMemo(()=>{
        return views.find(item=>item.viewID===currentView);
    },[currentView,views]);

    //根据视图列配置生成列
    const getColumn=(sendMessageToParent,currentView,field,index,isFixed)=>{
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

        const filterDropdown=<FilterDropdown sendMessageToParent={sendMessageToParent} field={field} index={index}/>;
        const filterIcon=<FilterIcon field={field}/>;

        return {
            dataIndex:field.field,
            title:()=>(<Tooltip title={<I18nLabel label={field.name}/>}><div className="table-header"><I18nLabel label={field.name}/></div></Tooltip>),
            filterDropdown:filterDropdown,
            filterIcon: filterIcon,
            width:field.width,
            fixed:(isFixed?'left':''),
            ellipsis: {
                showTitle: false,
            },
            onCell:(record,rowIndex)=>{
                if(field.cellStyle){
                    const cellStyle=getCellStyleFunc(field.cellStyle)(record,rowIndex);
                    return {style:cellStyle};
                }        
            },
            render:(text, record, index)=>{
                return <ColumnControl sendMessageToParent={sendMessageToParent} text={text} field={field} record={record} index={index} />;
            },
            onHeaderCell: (column) => ({
                width: column.width,
                resizable:isFixed?false:true,
                onColumnResize: (width) => {
                    dispatch(setViewFieldWidth({viewID:currentView,field:field.field,width:width}));
                }
            })
        }
    };

    const getOperationColumn=(rowToolbar,sendMessageToParent)=>{
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
                                                ,
            onHeaderCell: (column) => ({
                width: column.width,
                resizable:false,
            })
        }
    };
    
    const columns=useMemo(()=>{
        let columns=[];
        if(viewConf){
            const rowToolbar=viewConf.toolbar?.rowToolbar;
            if(rowToolbar?.buttons?.length>0){
                columns.push(getOperationColumn(rowToolbar,sendMessageToParent));
            }
            if(viewConf.fields){
                viewConf.fields.forEach((fieldItem,index) => {
                    if(fieldItem.visible!==false){
                        const fieldConf=fields.find(item=>item.field===fieldItem.field);
                        if(fieldConf){
                            columns.push(getColumn(sendMessageToParent,currentView,{...fieldConf,...fieldItem},index,fixedColumn>index)); 
                        }
                    }
                });
            }
        }
        return columns
    },[fields,viewConf,fixedColumn,currentView,sendMessageToParent]);

    const searchFields=useMemo(()=>{
        let searchFields=[];
        //const viewConf=views.find(item=>item.viewID===currentView);
        if(viewConf&&viewConf.fields){
            viewConf.fields.forEach((fieldItem,index) => {
                const fieldConf=fields.find(item=>item.field===fieldItem.field);
                if(fieldConf){
                    let searchField={
                        field:fieldItem.field,
                        dataType:fieldConf.dataType,
                        summarize:fieldItem.summarize
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
                    if(fieldConf.fieldType===FIELD_TYPE.FILE){
                        searchField.fieldType=FIELD_TYPE.FILE;
                    }
                    searchFields.push(searchField);
                }
            });
        }
        return searchFields
    },[fields,currentView]);

    useEffect(()=>{
        if(item&&origin&&searchFields.length>0){
            /*const getAssociationModelID=(modleid,relatedModelID)=>{
                if(modelID>relatedModelID){
                    return `${relatedModelID}_${modelID}`;
                }
                    
                return `${modelID}_${relatedModelID}`;
            }*/

            /*const getRelatedFilter=(fieldConf,filterValue)=>{
                console.log('getRelatedFilter',fieldConf,filterValue);
                filterValue=filterValue['Op.in'];
                if(filterValue instanceof Array){
                    //对many2many或one2many或者one2many字段进行特殊处理
                    if(fieldConf.fieldType===FIELD_TYPE.MANY2MANY){
                        const subSelect='select '+modelID+"_id as id from "+getAssociationModelID(modelID,fieldConf.relatedModelID)+" where "+fieldConf.relatedModelID+"_id in ('"+filterValue.join("','")+"')";
                        return {id:{'Op.in':subSelect}};
                    } else if(fieldConf.fieldType===FIELD_TYPE.ONE2MANY){
                        const subSelect='select '+fieldConf.relatedField+" as id from "+fieldConf.relatedModelID+" where id in '"+filterValue.join("','")+"')";
                        return {id:{'Op.in':subSelect}};
                    }
                }
            };*/
    
            let queryFilter={...filter};
            let relatedFilter=[];
            //合并视图本身的过滤条件
            if(viewConf.filter&&Object.keys(viewConf.filter).length>0){
                relatedFilter.push(viewConf.filter);
            }

            //这里处理many2many的过滤，在前端构造sql实现过滤不太合理，暂时注释掉，改为后端处理
            /*
            Object.keys(queryFilter).forEach(key=>{
                const fieldConf=fields.find(item=>item.field===key);
                if(fieldConf&&(fieldConf.fieldType===FIELD_TYPE.MANY2MANY||
                    fieldConf.fieldType===FIELD_TYPE.ONE2MANY)){
                    const relfilter=getRelatedFilter(fieldConf,queryFilter[key])
                    if(relfilter){
                        relatedFilter.push(relfilter);
                    }
                    delete queryFilter[key];
                }
            });*/

            if(relatedFilter.length>0){
                if(Object.keys(queryFilter).length>0){
                    queryFilter={
                        'Op.and':[queryFilter,...relatedFilter]
                    };
                } else {
                    if(relatedFilter.length===1){
                        queryFilter=relatedFilter[0];
                    } else {
                        queryFilter={
                            'Op.and':relatedFilter
                        };
                    }
                }
            }
            /*//合并视图本身的过滤条件
            if(viewConf.filter&&Object.keys(viewConf.filter).length>0){
                if(Object.keys(filter).length>0){
                    queryFilter={
                        'Op.and':[filter,viewConf.filter]
                    };
                } else {
                    queryFilter=viewConf.filter;
                }
            }*/
            //如果页面没有指定排序字段，则按照视图配置的排序
            let querySorter=sorter;
            if(querySorter.length===0){
                querySorter=viewConf.sorter;
            }

            const frameParams={frameType:item.frameType,frameID:item.params.key,origin:origin};
            const queryParams={modelID,viewID:currentView,filterData:viewConf.filterData,filter:queryFilter,pagination,sorter:querySorter,fields:searchFields};
            sendMessageToParent(createQueryDataMessage(frameParams,queryParams,queryQueenable));
        }
    },[fields,searchFields,filter,pagination,sorter,sendMessageToParent,origin,item,currentView,modelID]);

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
            
            const rowStyle={
                style:{backgroundColor:'white',...rst}
            };
            return rowStyle
        }
        return ({
            style:{backgroundColor:'white'}
        });
    },[viewConf]);

    const getSummary=useCallback(()=>{
        if(viewConf&&viewConf.fields&&summaries){
            const commonColCount=viewConf.toolbar?.rowToolbar?2:1;
            return (
                <Table.Summary fixed>
                    <Table.Summary.Row>
                        <Table.Summary.Cell index={0}><I18nLabel label={{key:"page.crvlistview.summary"}}/></Table.Summary.Cell>
                        {
                            commonColCount===2?<Table.Summary.Cell index={1}></Table.Summary.Cell>:null
                        }    
                        {
                            viewConf.fields.map((field,index)=>{
                                if(field.summarize&&summaries[field.field]){
                                    let value=summaries[field.field];
                                    value=formatStringNumber(value); //value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                    return (
                                        <Table.Summary.Cell index={index+commonColCount}>{value}</Table.Summary.Cell>
                                    );
                                } else {
                                    return (
                                        <Table.Summary.Cell index={index+commonColCount}></Table.Summary.Cell>
                                    );
                                }
                            })
                        }
                    </Table.Summary.Row>
                </Table.Summary>
            )
        }
        return null;
    },[summaries,viewConf]);

    const scrollY=summaries?height-102:height-72;
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
                scroll={{ y: scrollY }}
                onRow={onRow}
                summary={getSummary}
                components={{ header: { cell: ResizableTitle } }}
            />
            <div ref={ref} style={{height:"100%",width:"100%"}}>{}</div>
        </div>
    )
}