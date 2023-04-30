//import { getControl } from "./controls";

import { useMemo } from 'react';
import {getControl} from '../../index';

export default function TableCell(props){
    const {colNo,dataPath,field,disabled,sendMessageToParent,setCurrentRow,isCurrent,rowKey}=props;

    const component=useMemo(()=>{
        if(isCurrent===true){
            return getControl({...field,inline:true,disabled:disabled},field,sendMessageToParent,dataPath);
        }
        return getControl({...field,inline:true,disabled:true},field,sendMessageToParent,dataPath);
    },[isCurrent,field,dataPath,sendMessageToParent,disabled]);

    const wrapperStyle=useMemo(()=>{
        return {
            gridColumnStart:colNo+1,
            gridColumnEnd:colNo+2,
            gridRowStart:1,
            gridRowEnd:2,
            backgroundColor:"#FFFFFF",
            borderBottom:'1px solid #d9d9d9',
            borderLeft:'1px solid #d9d9d9',
            padding:1
        }},[colNo]);

    const ondblclick=()=>{
        setCurrentRow(rowKey);
    }

    return (
        <div onDoubleClick={ondblclick} style={wrapperStyle} >
            {component}
        </div>
    );
}