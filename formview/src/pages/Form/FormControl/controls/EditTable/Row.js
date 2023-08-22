import { useMemo } from "react";
import DeleteRowButton from "./DeleteRowButton";
import TableCell from "./TableCell";

export default function Row({dataPath,control,rowKey,onDeleteRow,sendMessageToParent,setCurrentRow,isCurrent}){

    const {templateColumns,columns}=useMemo(()=>{
        let templateColumns='';
        const columns=control.controls
        .filter(item=>item.visible)
        .map((field,index)=>{
            templateColumns+=(field.width?(field.width+'px '):'auto ');
            return (
                <TableCell 
                    colNo={index+1}
                    key={field.field}               
                    dataPath={dataPath}
                    field={field} 
                    disabled={control.disabled}
                    sendMessageToParent={sendMessageToParent}
                    setCurrentRow={setCurrentRow}
                    isCurrent={isCurrent}
                    rowKey={rowKey}
                    />
            );
        });
        return {templateColumns,columns};
    },[control,dataPath,sendMessageToParent,rowKey,setCurrentRow,isCurrent]);

    const gridTemplateColumns='32px '+templateColumns;

    return (
        <div style={{display:'grid',gridTemplateColumns:gridTemplateColumns,gridAutoRows:'minmax(20px, auto)'}}>
            <DeleteRowButton 
                lable={control.deleteButtonLabel}
                disabled={control.disabled} 
                colNo={0}
                rowKey={rowKey} 
                onDeleteRow={onDeleteRow}/>
            {columns}
        </div>
    );
}