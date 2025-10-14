import { IConRect, IConArrow, IConEllipse, IConText, IConDownload } from './icons';
import { ColorPicker,Space,Button,InputNumber } from 'antd';
import I18nLabel from '../../../../../../component/I18nLabel';
import './index.css';

export default function getToolbar({drawShapeType,setDrawShapeType,getDataUrl,strokeColor,setStrokeColor,fontSize,setFontSize,strokeWidth,setStrokeWidth}) {

    const downloadImage = () => {
        const link = document.createElement('a');
        link.href = getDataUrl();
        link.download = 'image.png';
        link.click();
    }

    return (
        <Space style={{width: '100%',padding: '8px 8px'}}>
            <Button size='small'  type={drawShapeType==="rect"?"primary":null} icon={<IConRect />} onClick={()=>setDrawShapeType('rect')}></Button>
            <Button size='small'  type={drawShapeType==="arrow"?"primary":null} icon={<IConArrow />} onClick={()=>setDrawShapeType('arrow')}></Button>
            <Button size='small'  type={drawShapeType==="ellipse"?"primary":null} icon={<IConEllipse />} onClick={()=>setDrawShapeType('ellipse')}></Button>
            <Button size='small'  type={drawShapeType==="text"?"primary":null} icon={<IConText />} onClick={()=>setDrawShapeType('text')}></Button>
            <ColorPicker defaultValue={strokeColor} value={strokeColor} size='small' onChange={(color,css)=>setStrokeColor(css)} />
            <InputNumber size='small' addonBefore={<I18nLabel label={{key:"page.formview.imageList.fontSizeLabel",default:"字体大小"}}/>} defaultValue={20} value={fontSize} onChange={(value)=>setFontSize(value)} />
            <InputNumber size='small' addonBefore={<I18nLabel label={{key:"page.formview.imageList.strokeWidthLabel",default:"线条宽度"}}/>} defaultValue={4} value={strokeWidth} onChange={(value)=>setStrokeWidth(value)} />
            <Button size='small'  icon={<IConDownload />} onClick={()=>downloadImage()}></Button>
        </Space>
    )
}
