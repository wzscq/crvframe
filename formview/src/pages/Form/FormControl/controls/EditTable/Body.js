import Row from "./Row";

export default function Body({dataPath,control,rowKeys,onDeleteRow,sendMessageToParent}){
    const rows=rowKeys.map((rowKey,index)=>{
        return (
            <Row 
                dataPath={[...dataPath,rowKey]}
                key={rowKey} 
                rowKey={rowKey}
                control={control} 
                onDeleteRow={onDeleteRow}
                sendMessageToParent={sendMessageToParent}
            />
        );
    });
    
    return (
        <>
            {rows}
        </>
    );
}