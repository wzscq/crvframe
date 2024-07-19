import { createSelector } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { Space,Tooltip } from 'antd';

import Header from './Header';
import Body from './Body';
import { 
    createRow,
    deleteRow,
    removeErrorField
} from '../../../../../redux/dataSlice';
import I18nLabel from '../../../../../component/I18nLabel';
import './index.css';
import { useCallback, useMemo } from 'react';

import {CC_COLUMNS} from '../../../../../utils/constant';

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

const selectValueError=(data,dataPath,field)=>{
    const errFieldPath=dataPath.join('.')+'.'+field;
    return data.errorField[errFieldPath];
}

const resultEqualityCheck=(a,b)=>{
    return (JSON.stringify(a)===JSON.stringify(b));
}

const makeSelector=()=>{
    return createSelector(
        selectUpdatedValue,
        selectValueError,
        (updatedValue,valueError)=>{
            let rowKeys=[];
            if(updatedValue?.list){
                rowKeys=Object.entries(updatedValue.list).sort((a,b)=>a[1][CC_COLUMNS.CC_SN]-b[1][CC_COLUMNS.CC_SN]).map(item=>item[0]);
            }
            //const rowKeys=updatedValue?.list?Object.keys(updatedValue.list):[];
            return {rowKeys,valueError};
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
    const {rowKeys,valueError}=useSelector(state=>selectValue(state.data,dataPath,field.field));
    
    const onAddNewRow=useCallback(()=>{

        dispatch(createRow({dataPath:[...dataPath,field.field,'list'],initData:{}}));
        if(valueError){
            const errFieldPath=dataPath.join('.')+'.'+field.field;
            dispatch(removeErrorField(errFieldPath));
        }
    },[dispatch,dataPath,field,valueError]);

    const onDeleteRow=useCallback((rowKey)=>{
        //取出已经删除的数据
        dispatch(deleteRow({
            dataPath:[...dataPath,field.field,'list'],
            rowKey:rowKey}));

        if(valueError){
            const errFieldPath=dataPath.join('.')+'.'+field.field;
            dispatch(removeErrorField(errFieldPath));
        }
    },[dispatch,dataPath,field,valueError]);

    const label=control.label?control.label:(field?field.name:"");
    const header=(<Header control={control} onAddNewRow={onAddNewRow}/>);

    let wrapperStyle={maxHeight:control.maxHeight};
    if(valueError){
        wrapperStyle={...wrapperStyle,border:'1px solid red'};
    }

    let tableControl=(
        <div className='control-edittable-body-wrapper' style={wrapperStyle}>
            <Body 
                dataPath={[...dataPath,field.field,'list']}
                sendMessageToParent={sendMessageToParent} 
                control={control} 
                rowKeys={rowKeys} 
                onDeleteRow={onDeleteRow} 
                header={header}
            />
        </div>
    );

    tableControl=valueError?(
        <Tooltip title={<I18nLabel label={valueError.message}/>}>
            {tableControl}
        </Tooltip>):tableControl

    return (
        <div className='control-edittable-main'>
            <Space size={2} direction="vertical" style={{width:'100%'}}>
                <div style={{width:'100%',textAlign:'left'}}>
                    {control.required?(<span style={{color:'red'}}>*</span>):null}
                    <I18nLabel label={label}/>
                </div>
                {tableControl}
            </Space>
        </div>
    );
}