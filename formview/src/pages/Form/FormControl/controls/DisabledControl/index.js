//import {useState,useRef,useEffect} from 'react';
//import { Tooltip } from 'antd';

const disabledControlStyle={
  width:'100%',
  height:'auto',
  border:'1px solid rgb(217, 217, 217)',
  borderRadius:2,
  padding:'4px 11px',
  backgroundColor:'#F5F5F5'
}

const inlineControlStyle={
  width:'100%',
  height:'100%',
  minHeight:28  ,
  border:'0px solid rgb(217, 217, 217)',
  borderRadius:0,
  padding:'3px 11px',
  backgroundColor:'#F5F5F5',
  
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