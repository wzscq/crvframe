import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tag,Space,Checkbox  } from 'antd';
import {SortAscendingOutlined,SortDescendingOutlined  } from '@ant-design/icons';
import { setSorter,resetFieldFilter,setFixedColumn,setSelectAll } from "../../../redux/dataSlice";
import useI18n from "../../../hooks/useI18n";

import './index.css';

export default function StatusBar(){
    const {getLocaleLabel}=useI18n();
    const dispatch=useDispatch();
    const {fields}=useSelector(state=>state.definition);
    const currentView = useSelector(state=>state.definition.views.find(item=>item.viewID===state.data.currentView));
    const {total,selectedRowKeys,sorter,filterValueLabel,fixedColumn,selectAll}=useSelector(state=>state.data.views[state.data.currentView].data);
    
    const resetFixedColumn=useCallback(()=>{
        dispatch(setFixedColumn(0));
    },[dispatch]);

    const fixedTab=useMemo(()=>{
        if(fixedColumn>0){
            return (<Tag closable onClose={resetFixedColumn}><span style={{padding:5}}>{getLocaleLabel({key:'page.crvlistview.fixedColumn',default:'冻结列:'})+fixedColumn}</span></Tag>);
        }
        return null;
    },[fixedColumn,resetFixedColumn,getLocaleLabel]);
    
    const resetSorter=useCallback(()=>{
        dispatch(setSorter([]));
    },[dispatch]);

    const onSelectAllChange=(e)=>{
        //console.log(`onSelectAllChange = ${e.target.checked}`);
        dispatch(setSelectAll(e.target.checked));
    }

    const sorterTag=useMemo(()=>{
        if(sorter.length>0){
            const fieldConf=fields.find(item=>item.field===sorter[0].field);
            if(fieldConf){
                return (<Tag closable onClose={resetSorter}>{sorter[0].order==='asc'?<SortAscendingOutlined/>:<SortDescendingOutlined/>}<span style={{padding:5}}>{getLocaleLabel(fieldConf.name)}</span></Tag>);
            }
        }
        return null;
    },[sorter,fields,resetSorter,getLocaleLabel]);

    const deleteFilter=useCallback((field)=>{
        dispatch(resetFieldFilter(field));
    },[dispatch]);

    const filterTags=useMemo(()=>{
        const filterTags=[];
        fields.forEach(field => {
            if(filterValueLabel[field.field]){
                filterTags.push(
                    <Tag key={field.field} closable onClose={()=>deleteFilter(field.field)}><span style={{padding:5}}>{getLocaleLabel(field.name)}{":"}{filterValueLabel[field.field]}</span></Tag>
                );
            }
        });
        console.log('filterTags:'+JSON.stringify(filterValueLabel));
        return filterTags;
    },[filterValueLabel,fields,deleteFilter,getLocaleLabel]);

    const selectCount=selectAll===true?total:selectedRowKeys.length;
    const sumLabel=getLocaleLabel({key:'page.crvlistview.total',default:'共 '})+
                    total+
                    getLocaleLabel({key:'page.crvlistview.item',default:' 条'})+'，'+
                    getLocaleLabel({key:'page.crvlistview.selected',default:'选中 '})+
                    (selectCount)+
                    getLocaleLabel({key:'page.crvlistview.item',default:' 条'});

    let selectAllControl=null;
    console.log('currentView.selectAll',selectAll);
    if(currentView?.options?.showSelectAll===true){
        selectAllControl=(<Checkbox checked={selectAll} onChange={onSelectAllChange}>{getLocaleLabel({key:'page.crvlistview.selectAll',default:'选择全部'})}</Checkbox>);                
    }

    return (
        <div className="status-bar">
            <Space>
                <Tag>{sumLabel}</Tag>
                {selectAllControl}
                {fixedTab}
                {sorterTag}
                {filterTags}
            </Space>
        </div>
    )
}