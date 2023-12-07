import ImagePreview from './ImagePreview';
import PdfPreview from './PdfPreview';

export default function Preview({item,height}){
  if(item.contentBase64===undefined){
    return null;
  }

  const ext=item.name.split('.').pop().toLowerCase();

  if(ext==='pdf'){
    return (<PdfPreview item={item} height={height} type='application/pdf'/>);
  }

  if(ext==='tif'){
    return (<PdfPreview item={item} height={height} type='image/tiff'/>);
  }

  return (
    <ImagePreview item={item} height={height} type={'image/'+ext}/>
  );
}