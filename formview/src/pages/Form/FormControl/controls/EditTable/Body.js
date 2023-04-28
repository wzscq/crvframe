import {useState} from "react";

import Row from "./Row";

export default function Body({dataPath,control,rowKeys,onDeleteRow,sendMessageToParent,header}){
    const [currentRow,setCurrentRow]=useState(undefined);
    
    const rows=rowKeys.map((rowKey,index)=>{
        return (
            <Row 
                dataPath={[...dataPath,rowKey]}
                key={rowKey} 
                rowKey={rowKey}
                control={control} 
                onDeleteRow={onDeleteRow}
                sendMessageToParent={sendMessageToParent}
                setCurrentRow={setCurrentRow}
                isCurrent={currentRow===rowKey}
            />
        );
    });
    
    return (
        <>
            {header}
            {rows}
        </>
    );
}