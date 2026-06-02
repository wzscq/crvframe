import { Input,Checkbox,Space } from "antd";
import { useState } from "react";
import useI18n from '../../../../../hooks/useI18n';
const {TextArea} = Input;

export default function TextArea1({field,filterValue,onFilterChange}){
    const {getLocaleLabel}=useI18n();
    const [filterEmpty,setFilterEmpty]=useState(false)

    const onChange=(e)=>{
        //基于换行符对文本进行拆分
        const items = e.target.value.split(/\r?\n/);
        if(items.length<=1){
            onFilterChange(e.target.value,e.target.value);
        } else {
            const value={'Op.in':items}
            const label=items[0]+',...'
            onFilterChange(value,label);
        }
    }

    const onCheckChange=(e)=>{
        setFilterEmpty(e.target.checked)
        if(e.target.checked===true){
            const label=getLocaleLabel({key:'page.crvlistview.emptyValue',default:"空值"})
            const value={'Op.or':[
                {[field.field]:{'Op.eq':''}},
                {[field.field]:{'Op.is':'null'}},
            ]}
            onFilterChange(value,label);
        } else {
            onFilterChange(null,null);
        }
    }



    let valueStr=filterValue&&filterValue['Op.in']?filterValue['Op.in'].join('\n'):filterValue;

    return (
        <div>
            <Space direction="vertical">
                <Checkbox onChange={onCheckChange}>{getLocaleLabel({key:'page.crvlistview.filterEmptyValue',default:"筛选空值"})}</Checkbox>
                <TextArea
                    disabled={filterEmpty}
                    placeholder={`Search ${field.field}`}
                    value={filterEmpty===false?valueStr:""}
                    onChange={onChange}
                    style={{ marginBottom: 8, display: 'block' }}
                />
            </Space>
        </div>
    );
}