import AddRowButton from "./AddRowButton";
import I18nLabel from "../../../../../component/I18nLabel";

export default function Header({control,onAddNewRow}){
    let gridTemplateColumns='';
    const columns=control.controls
        .filter(item=>item.visible)
        .map((field,index)=>{
        gridTemplateColumns+=(field.width?(field.width+'px '):'auto ');
        
        const wrapperStyle={
            gridColumnStart:index+1,
            gridColumnEnd:index+2,
            gridRowStart:1,
            gridRowEnd:2,
            backgroundColor:"#FFFFFF",
            borderBottom:'1px solid #d9d9d9',
            borderLeft:'1px solid #d9d9d9',
            padding:2}

        return (
            <div style={wrapperStyle}>
                <I18nLabel label={field.label}/>
            </div>
        );
    });

    gridTemplateColumns+=' 30px';
    columns.push(<AddRowButton label={control.addButtonLable} disabled={control.disabled} colNo={columns.length} onAddNewRow={onAddNewRow}/>);

    return (
        <div style={{display:'grid',gridTemplateColumns:gridTemplateColumns,gridAutoRows:'minmax(20px, auto)'}}>
            {columns}
        </div>
    );
}