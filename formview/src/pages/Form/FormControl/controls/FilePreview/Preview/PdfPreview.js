export default function PdfPreview({item,height,type}){
  return (
    <div style={{width:'100%'}}>
      <iframe frameBorder={'0'} allowfullscreen='true' webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen name={item.name} title={item.name} src={'data:'+type+';base64,'+item.contentBase64} type={type} width='100%' height={height}/>
    </div>
  );
}