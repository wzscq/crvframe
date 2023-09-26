//import {useState,useRef,useEffect} from 'react';
//import { Tooltip } from 'antd';

const disabledControlStyle={
  height:'auto',
  minHeight:32,
  lineHeight:'32px',
  border:'1px solid rgb(217, 217, 217)',
  borderRadius:6,
  padding:'0px 5px',
  backgroundColor:'#F5F5F5',
  lineBreak:'anywhere'
}

const inlineControlStyle={
  width:'calc(100% - 10px)',
  height:'100%',
  minHeight:28  ,
  border:'0px solid rgb(217, 217, 217)',
  borderRadius:0,
  padding:'0px 5px',
  backgroundColor:'#F5F5F5',
  lineBreak:'anywhere'
}

export default function DisabledControl({value,style,inline}){
  //const [showTip,setShowTip]=useState(false);
  //const ref=useRef();

  /*useEffect(()=>{
    if(ref.current){
        if(ref.current.offsetWidth < ref.current.scrollWidth){
            setShowTip(true);
        }
    }
  },[ref]);*/

  if(inline===true){
    return (<div  style={{...inlineControlStyle,...style}}>{value}</div>);
    /*return showTip?
      (
      <Tooltip placement="bottom" title={value}>
        <div ref={ref} style={{...inlineControlStyle,...style}}>{value}</div>
      </Tooltip>):
      (<div  ref={ref} style={{...inlineControlStyle,...style}}>{value}</div>)*/     
  }
  return <div style={{...disabledControlStyle,...style}}>{value}</div>        
}