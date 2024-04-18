import { InputNumber  } from "antd";

import { formatStringNumber } from "../../../../../../utils/functions";
import useI18n from '../../../../../../hooks/useI18n';

import './index.css';

export default function NumberFilter({field,filterValue,onFilterChange}){
    const {getLocaleLabel}=useI18n();

    const upateFilter=(filter)=>{
        let label='';
        if(filter['Op.gte'] !==undefined ){
            label=label+getLocaleLabel({key:'page.crvlistview.gte',default:'大于等于:'})+filter['Op.gte'];
        }

        if(filter['Op.lte'] !==undefined){
            label=label+','+getLocaleLabel({key:'page.crvlistview.lte',default:'小于等于:'})+filter['Op.lte'];
        }
        
        onFilterChange(filter,label);
    }
    
    const onChangeFrom=(value)=>{
        const newFilterValue={...filterValue};
        if(value!==undefined&&value!==null){
            newFilterValue['Op.gte']=value;
        } else {
            delete newFilterValue['Op.gte'];
        }
        //if(Object.keys(newFilterValue).length>0){
            upateFilter(newFilterValue);
        //}
    }

    const onChangeTo=(value)=>{
        const newFilterValue={...filterValue};
        if(value!==undefined&&value!==null){
            newFilterValue['Op.lte']=value;
        } else {
            delete newFilterValue['Op.lte'];
        }

        //if(Object.keys(newFilterValue).length>0){
            upateFilter(newFilterValue);
        //}
    }

    //这里过滤条件的值形式为
    //{op.gte:valueFrom,op.lte:valueTo}
    let valueFrom=filterValue?filterValue['Op.gte']:"";
    let valueTo=filterValue?filterValue['Op.lte']:"";
    

    return (
        <div className="filter-input-number">
            <div>{getLocaleLabel({key:'page.crvlistview.gte',default:'大于等于:'})}</div>
            <InputNumber   
                value={valueFrom} 
                onChange={onChangeFrom}
                formatter={(value) =>formatStringNumber(value,'en-US')}
                parser={(value) => value.replace(/,/g, '')}
            />
            <div>{getLocaleLabel({key:'page.crvlistview.lte',default:'小于等于:'})}</div>
            <InputNumber   
                value={valueTo} 
                onChange={onChangeTo}
                formatter={(value) =>formatStringNumber(value,'en-US')}
                parser={(value) => value.replace(/,/g, '')}
            />
        </div>
    );
}