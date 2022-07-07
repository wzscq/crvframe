import {Select} from 'antd';
import useI18n from '../../../../../../../hooks/useI18n';

const { Option } = Select;

export default function SingleSelectForOptions({field,filterValue,onFilterChange}){
    const {getLocaleLabel}=useI18n();

    const onChange=(value)=>{
        onFilterChange(value);
    }

    const options=field.options.map((item,index)=>
    (<Option key={index} value={item.value}>
        {getLocaleLabel(item.label)}
    </Option>));
    
    return (<Select  
        style={{minWidth:200,marginBottom:8,display:'block'}}
        value={filterValue} 
        allowClear
        onChange={onChange}
        >
        {options}
    </Select>);
}