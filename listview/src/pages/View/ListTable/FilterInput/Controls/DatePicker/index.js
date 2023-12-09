import { DatePicker } from "antd";
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import useI18n from '../../../../../../hooks/useI18n';

import './index.css';

export default function DatePickerFilter({field,filterValue,onFilterChange}){
    const {getLocaleLabel}=useI18n();

    const upateFilter=(filter)=>{
        let label='';
        if(filter['Op.gte']){
            label=label+getLocaleLabel({key:'page.crvlistview.from',default:'从:'})+filter['Op.gte'];
        }

        if(filter['Op.lte']){
            label=label+','+getLocaleLabel({key:'page.crvlistview.to',default:'到:'})+filter['Op.lte'];
            filter['Op.lte']=filter['Op.lte']+' 23:59:59';
        }
        
        onFilterChange(filter,label);
    }
    
    const onChangeFrom=(date,dateString)=>{
        const newFilterValue={...filterValue};
        if(date){
            newFilterValue['Op.gte']=dateString;
        } else {
            delete newFilterValue['Op.gte'];
        }
        if(Object.keys(newFilterValue).length>0){
            upateFilter(newFilterValue);
        }
    }

    const onChangeTo=(date,dateString)=>{
        const newFilterValue={...filterValue};
        if(date){
            newFilterValue['Op.lte']=dateString;
        } else {
            delete newFilterValue['Op.lte'];
        }

        if(Object.keys(newFilterValue).length>0){
            upateFilter(newFilterValue);
        }
    }

    //这里过滤条件的值形式为
    //{op.gte:valueFrom,op.lte:valueTo}
    let valueFrom=filterValue?filterValue['Op.gte']:undefined;
    if(valueFrom&&valueFrom.length>0){
        valueFrom=dayjs(valueFrom);
    }
    
    let valueTo=filterValue?filterValue['Op.lte']:undefined;
    if(valueTo&&valueTo.length>0){
        valueTo=dayjs(valueTo);
    }

    return (
        <div className="filter-input-datepicker">
            <div>{getLocaleLabel({key:'page.crvlistview.from',default:'从:'})}</div>
            <DatePicker  
                value={valueFrom} 
                onChange={onChangeFrom}
                showTime={field.showTime}
            />
            <div>{getLocaleLabel({key:'page.crvlistview.to',default:'到:'})}</div>
            <DatePicker  
                value={valueTo} 
                onChange={onChangeTo}
                showTime={field.showTime}
            />
        </div>
    );
}