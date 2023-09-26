import {useState,useEffect,useRef} from 'react';
import { Tooltip } from 'antd';
import dayjs from 'dayjs';

import { FIELD_TYPE } from "../../../../../../utils/constant";
import {
    getManyToOneValueFunc,
    formatStringNumber
} from "../../../../../../utils/functions";
import useI18n from '../../../../../../hooks/useI18n';

import './index.css';

export default function DefaultColumnControl({text,field, record, index}){
    const {getLocaleLabel}=useI18n();
    const [showTip,setShowTip]=useState(false);
    const ref=useRef();
    let className='listtable-column-text';
    let value=text;
 
    if(text&&field.fieldType===FIELD_TYPE.MANY2ONE){
        
        if(field.optionLabel&&text.list&&text.list.length>0){
            value=text.list[0][field.optionLabel];
            if(value===undefined){
                value=getManyToOneValueFunc(field.optionLabel)(text.list[0]);
            }
        } else {
            value=text.value!==undefined?text.value:text;
        }
    } else if(field.options){
        const option=field.options.find(item=>item.value===value);
        if(option){
            value=getLocaleLabel(option.label);
        }
    } else if(text&&(field.dataType==='decimal'||field.dataType==='int')){
        value=formatStringNumber(text); //.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        className='listtable-column-number';
    } else if(text&&field.dataType==='datetime'&&field.format){
        value=dayjs(text).format(field.format);
    } else if(text&&field.fieldType===FIELD_TYPE.MANY2MANY){
        if(field.aggregateFunction&&text.list&&text.list.length>0){
            value=getManyToOneValueFunc(field.aggregateFunction)(text.list);
        } else {
            value="";
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
                <span ref={ref} className={className}>{value}</span>
            </Tooltip>
        ):(
            <span ref={ref} className={className}>{value}</span>
        );
}