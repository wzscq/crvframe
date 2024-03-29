import AddRowButton from "./AddRowButton";
import I18nLabel from "../../../../../component/I18nLabel";

export default function Header({control,onAddNewRow,fixed}){
    let gridTemplateColumns='32px ';
    const columns=control.controls
        .filter(item=>item.visible)
        .map((field,index)=>{
        gridTemplateColumns+=(field.width?(field.width+'px '):'auto ');
        
        const wrapperStyle={
            gridColumnStart:index+2,
            gridColumnEnd:index+3,
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

    return (
        <div style={{position:fixed?'fixed':'',top:0,display:'grid',gridTemplateColumns:gridTemplateColumns,gridAutoRows:'minmax(20px, auto)'}}>
            <AddRowButton label={control.addButtonLable} disabled={control.disabled} colNo={0} onAddNewRow={onAddNewRow}/>
            {columns}
        </div>
    );
}