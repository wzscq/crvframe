import { Input,Checkbox,Space } from "antd";
import { useState } from "react";
import useI18n from '../../../../../hooks/useI18n';

export default function Text({field,filterValue,onFilterChange}){
    const {getLocaleLabel}=useI18n();
    const [filterEmpty,setFilterEmpty]=useState(false)

    const onChange=(e)=>{
        onFilterChange(e.target.value,e.target.value);
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

    return (
        <div>
            <Space direction="vertical">
                <Checkbox onChange={onCheckChange}>{getLocaleLabel({key:'page.crvlistview.filterEmptyValue',default:"筛选空值"})}</Checkbox>
                <Input
                    disabled={filterEmpty}
                    placeholder={`Search ${field.field}`}
                    value={filterEmpty===false?filterValue:""}
                    onChange={onChange}
                    style={{ marginBottom: 8, display: 'block' }}
                />
            </Space>
        </div>
    );
}