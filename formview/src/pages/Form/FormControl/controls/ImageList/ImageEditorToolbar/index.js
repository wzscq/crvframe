import { IConRect, IConArrow, IConEllipse, IConText, IConDownload,IConBack } from './icons';
import { ColorPicker,Space,Button,InputNumber,Tooltip } from 'antd';
import I18nLabel from '../../../../../../component/I18nLabel';
import SelectFonts from './SelectFonts';
import './index.css';


export default function getToolbarWrapper(fonts) {

    return ({drawShapeType,setDrawShapeType,getDataUrl,strokeColor,setStrokeColor,fontSize,setFontSize,strokeWidth,setStrokeWidth,rollback,fontFamily,setFontFamily})=>{
        const downloadImage = () => {
            const link = document.createElement('a');
            link.href = getDataUrl();
            link.download = 'image.png';
            link.click();
        }

        const onRollback = () =>{
            if(rollback){
                rollback()
            }
        }

        return (
            <Space style={{width: '100%',padding: '8px 8px'}}>
                <Tooltip title={<I18nLabel label={{key:"page.formview.imageList.rect",default:"矩形"}}/>}><Button size='small'   type={drawShapeType==="rect"?"primary":null} icon={<IConRect />} onClick={()=>setDrawShapeType('rect')}></Button></Tooltip>
                <Tooltip title={<I18nLabel label={{key:"page.formview.imageList.arrow",default:"箭头"}}/>}><Button size='small'  type={drawShapeType==="arrow"?"primary":null} icon={<IConArrow />} onClick={()=>setDrawShapeType('arrow')}></Button></Tooltip>
                <Tooltip title={<I18nLabel label={{key:"page.formview.imageList.ellipse",default:"椭圆"}}/>}><Button size='small'  type={drawShapeType==="ellipse"?"primary":null} icon={<IConEllipse />} onClick={()=>setDrawShapeType('ellipse')}></Button></Tooltip>
                <Tooltip title={<I18nLabel label={{key:"page.formview.imageList.text",default:"文字"}}/>}><Button size='small'  type={drawShapeType==="text"?"primary":null} icon={<IConText />} onClick={()=>setDrawShapeType('text')}></Button></Tooltip>
                <ColorPicker defaultValue={strokeColor} value={strokeColor} size='small' onChange={(color,css)=>setStrokeColor(css)} />
                <SelectFonts fonts={fonts} fontFamily={fontFamily} setFontFamily={setFontFamily} />
                <InputNumber style={{width:150}} size='small' addonBefore={<I18nLabel label={{key:"page.formview.imageList.fontSizeLabel",default:"字体大小"}}/>} min={1} defaultValue={20} value={fontSize} onChange={(value)=>setFontSize(value)} />
                <InputNumber style={{width:150}} size='small' addonBefore={<I18nLabel label={{key:"page.formview.imageList.strokeWidthLabel",default:"线条宽度"}}/>} min={1} defaultValue={4} value={strokeWidth} onChange={(value)=>setStrokeWidth(value)} />
                <Tooltip title={<I18nLabel label={{key:"page.formview.imageList.rollback",default:"撤销"}}/>}><Button size='small'  icon={<IConBack />} onClick={()=>onRollback()}></Button></Tooltip>
                <Tooltip title={<I18nLabel label={{key:"page.formview.imageList.download",default:"下载"}}/>}><Button size='small'  icon={<IConDownload />} onClick={()=>downloadImage()}></Button></Tooltip>
            </Space>
        )
    }
}
