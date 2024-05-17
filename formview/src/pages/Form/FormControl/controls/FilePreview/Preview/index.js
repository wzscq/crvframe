import ImagePreview from './ImagePreview';
import PdfPreview from './PdfPreview';
import OFDPreview from './OFDPreview';
import I18nLabel from '../../../../../../component/I18nLabel';

export default function Preview({item,height}){
  if(item.contentBase64===undefined){
    return null;
  }

  const ext=item.name.split('.').pop().toLowerCase();
  console.log('element',JSON.stringify(item));

  if(ext==='pdf'){
    return (<PdfPreview item={item} height={height} type='application/pdf'/>);
  }

  if(ext==='tif'){
    return (<PdfPreview item={item} height={height} type='image/tiff'/>);
  }

  if(ext==='ofd'){
    return (<OFDPreview item={item} height={height}/>);
  }

  if(ext==='jpg'||ext==='jpeg'||ext==='png'||ext==='gif'||ext==='bmp'){
    return (<ImagePreview item={item} height={height} type={'image/'+ext}/>);
  }

  return (
    <div><I18nLabel label={{key:'page.crvformview.notSurpportedPreviewFileType',default:'不支持的文件类型'}}/></div>
  );
}