import {Select} from 'antd';
import useI18n from '../../../../../../../hooks/useI18n';

const { Option } = Select;

export default function MultiSelectForOptions({field,filterValue,onFilterChange}){
    const {getLocaleLabel}=useI18n();

    const onChange=(value,option)=>{
        const label=option.map(item=>item.children).join(',');
        const filterVal={
            'Op.in':value
        }
        onFilterChange(filterVal,label);
    }

    const options=field.options.map((item,index)=>
    (<Option key={index} value={item.value}>
        {getLocaleLabel(item.label)}
    </Option>));
    
    return (<Select  
        mode="multiple"
        style={{maxWidth:200,minWidth:200,marginBottom:8,display:'block'}}
        value={filterValue?.['Op.in']} 
        allowClear
        onChange={onChange}
        >
        {options}
    </Select>);
}