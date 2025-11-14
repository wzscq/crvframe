import { Select } from 'antd';
import I18nLabel from '../../../../../../component/I18nLabel';

export default function SelectFonts({fonts,fontFamily,setFontFamily}){
    return (
        <div style={{marginLeft:5}}>
            <I18nLabel label={{key:"page.formview.imageList.fontFamily",default:"字体"}}/>
            <Select size='small' style={{minWidth:150,marginLeft:3}} options={fonts} value={fontFamily} onChange={(value)=>setFontFamily(value)} />
        </div>
    )
}