import React, { useRef, useEffect } from 'react';
import {parseOfdDocument, renderOfd} from "ofd.js";

export default function OFDPreview({item,height,type}){
    const refOFD=useRef();

    useEffect(()=>{
      if(refOFD.current){
        parseOfdDocument({
          ofd: 'data:'+type+';base64,'+item.contentBase64,
          success(res) {
            //输出ofd每页的div
            const divs = renderOfd(1000, res[0]);
            for(let i=0;i<divs.length;++i){
              refOFD.current.appendChild(divs[i]);
            }
            
            //获取签章div的信息, 具体看demo
            /*for(let ele of document.getElementsByName('seal_img_div')) {
               this.addEventOnSealDiv(ele, JSON.parse(ele.dataset.sesSignature), JSON.parse(ele.dataset.signedInfo));
            }*/
          },
          fail(error) {
            console.log('error',error)
          }
        });
      }
    },[item]);


    return (
      <div ref={refOFD} style={{width:'100%',height:height}}/>
    );
  }