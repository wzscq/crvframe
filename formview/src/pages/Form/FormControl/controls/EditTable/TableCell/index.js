//import { getControl } from "./controls";

import { useCallback, useMemo } from 'react';
import {getControl} from '../../index';

export default function TableCell(props){
    const {colNo,dataPath,field,sendMessageToParent}=props;

    const component=useMemo(()=>{
        return getControl({...field,inline:true},field,sendMessageToParent,dataPath);
    },[field,dataPath,sendMessageToParent]);

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
    return (
        <div style={wrapperStyle} >
            {component}
        </div>
    );
}