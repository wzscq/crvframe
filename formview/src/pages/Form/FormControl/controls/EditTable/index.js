import { createSelector } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { Space } from 'antd';

import Header from './Header';
import Body from './Body';
import { 
    createRow,
    deleteRow
} from '../../../../../redux/dataSlice';
import I18nLabel from '../../../../../component/I18nLabel';
import './index.css';
import { useCallback, useMemo } from 'react';

const selectUpdatedValue=(data,dataPath,field)=>{
    let updatedNode=data.updated;
    for(let i=0;i<dataPath.length;++i){
        updatedNode=updatedNode[dataPath[i]];
        if(!updatedNode){
            return undefined;
        }
    }
    return updatedNode[field];
};

const resultEqualityCheck=(a,b)=>{
    console.log('resultEqualityCheck',a,b);
    return (JSON.stringify(a)===JSON.stringify(b));
}

const makeSelector=()=>{
    return createSelector(
        selectUpdatedValue,
        (updatedValue)=>{
            const rowKeys=updatedValue.list?Object.keys(updatedValue.list):[];
            return {rowKeys};
        },
        {
            memoizeOptions:{
                resultEqualityCheck:resultEqualityCheck 
            }
        }
    );
}

export default function EditTable({dataPath,control,field,sendMessageToParent}){
    const dispatch=useDispatch();
    
    const selectValue=useMemo(makeSelector,[dataPath,control,field]);
    const {rowKeys}=useSelector(state=>selectValue(state.data,dataPath,field.field));
    
    const onAddNewRow=useCallback(()=>{
        dispatch(createRow([...dataPath,field.field,'list']));
    },[dispatch,dataPath,field]);

    const onDeleteRow=useCallback((rowKey)=>{
        //取出已经删除的数据
        dispatch(deleteRow({
            dataPath:[...dataPath,field.field,'list'],
            rowKey:rowKey}));
    },[dispatch]);

    const label=control.label?control.label:(field?field.name:"");
    return (
        <div className='control-edittable'>
            <Space size={2} direction="vertical" style={{width:'100%'}}>
                <div style={{width:'100%',textAlign:'left'}}>
                    {control.required?(<span style={{color:'red'}}>*</span>):null}
                    <I18nLabel label={label}/>
                </div>
                <div className='control-edittable'>
                    <div className='control-edittable-header-wrapper'>
                        <Header control={control} onAddNewRow={onAddNewRow}/>
                    </div>
                    <div className='control-edittable-body-wrapper'>
                        <Body 
                            dataPath={[...dataPath,field.field,'list']}
                            sendMessageToParent={sendMessageToParent} 
                            control={control} 
                            rowKeys={rowKeys} 
                            onDeleteRow={onDeleteRow} 
                        />
                    </div>
                </div>
            </Space>
        </div>
    );
}