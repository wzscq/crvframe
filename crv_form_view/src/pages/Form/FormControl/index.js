import {getControl} from './controls';

export default function FormControl({dataPath,item,field,sendMessageToParent}){
    const {row,col,rowSpan,colSpan}=item;
    const wrapperStyle={
        gridColumnStart:col,
        gridColumnEnd:col+colSpan,
        gridRowStart:row,
        gridRowEnd:row+rowSpan,
        zIndex:10,
        backgroundColor:"#FFFFFF",
        padding:5}
    
    return (
        <div style={wrapperStyle}>
            {getControl(item,field,sendMessageToParent,dataPath)}
        </div>
    );
}