import {useState,useEffect,useRef} from 'react';
import { Tooltip } from 'antd';

import { FIELD_TYPE } from "../../../../../../utils/constant";

import './index.css';

export default function FileControl({text,field, record, index}){
    const [showTip,setShowTip]=useState(false);
    const ref=useRef();
    let className='listtable-column-text';
    let value="";
 
    if(text&&field.fieldType===FIELD_TYPE.FILE&&text.list&&text.list.length>0){
        value=text.list.map(item=>item.name).join(",");
    }
    
    useEffect(()=>{
        if(ref.current){
            if(ref.current.offsetWidth < ref.current.scrollWidth){
                setShowTip(true);
            }
        }
    },[ref]);
    
    return showTip?(
            <Tooltip placement="bottomRight" title={value}>
                <span ref={ref} className={className}>{value}</span>
            </Tooltip>
        ):(
            <span ref={ref} className={className}>{value}</span>
        );
}