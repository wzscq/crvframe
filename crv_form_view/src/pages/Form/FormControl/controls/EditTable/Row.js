import { useMemo } from "react";
import DeleteRowButton from "./DeleteRowButton";
import TableCell from "./TableCell";

export default function Row({dataPath,control,rowKey,onDeleteRow,sendMessageToParent}){

    const {templateColumns,columns}=useMemo(()=>{
        let templateColumns='';
        const columns=control.controls
        .filter(item=>item.visible)
        .map((field,index)=>{
            templateColumns+=(field.width?(field.width+'px '):'auto ');
            return (
                <TableCell 
                    colNo={index}
                    key={field.field}               
                    dataPath={dataPath}
                    field={field} 
                    disabled={control.disabled}
                    sendMessageToParent={sendMessageToParent}  />
            );
        });
        return {templateColumns,columns};
    },[control,dataPath,sendMessageToParent]);

    const gridTemplateColumns=templateColumns+' 30px';
    columns.push(<DeleteRowButton 
        lable={control.deleteButtonLabel}
        disabled={control.disabled} 
        colNo={columns.length}
        rowKey={rowKey} 
        onDeleteRow={onDeleteRow}/>);

    return (
        <div style={{display:'grid',gridTemplateColumns:gridTemplateColumns,gridAutoRows:'minmax(20px, auto)'}}>
            {columns}
        </div>
    );
}