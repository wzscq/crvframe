import {useState,useEffect,useRef} from 'react';
import { Tooltip } from 'antd';

import { FIELD_TYPE } from "../../../../utils/constant";
import useI18n from '../../../../hooks/useI18n';

import './index.css';

export default function ColumnControl({text,field, record, index}){
    const {getLocaleLabel}=useI18n();
    const [showTip,setShowTip]=useState(false);
    const ref=useRef();
    let value=text;
    if(text&&field.fieldType===FIELD_TYPE.MANY2ONE){
        if(field.optionLabel&&text.list&&text.list.length>0){
            value=text.list[0][field.optionLabel];
        } else {
            value=text.value?text.value:text;
        }
    }

    if(field.options){
        const option=field.options.find(item=>item.value===value);
        if(option){
            value=getLocaleLabel(option.label);
        }
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
                <span ref={ref} className='listtable-column-control'>{value}</span>
            </Tooltip>
        ):(
            <span ref={ref} className='listtable-column-control'>{value}</span>
        );
}