import Viewer from 'react-viewer';
import {useEffect, useState} from 'react';

import './index.css'

export default function ImagePreview({item,height,type}){
  const [visible,setVisible]=useState(false);

  //这里由于container控件绑定问题，不能直接将visible设置为true，只能通过useEffect再渲染后再设置为true
  useEffect(()=>{
    setVisible(true);
  });

  return (
      <div style={{width:'100%',height:height}}>
        <div id="image_preview_container" style={{width:'100%',height:'100%'}}/>
        <Viewer
          visible={visible}
          noClose={true}
          onClose={() => {
            setVisible(false);
          }}
          images={[{src: item.contentBase64, alt: ''}]}
          container={document.getElementById("image_preview_container")}
        />
      </div>
  );
}