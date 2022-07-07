import { Input } from "antd";

export default function Text({field,filterValue,onFilterChange}){
    const onChange=(e)=>{
        onFilterChange(e.target.value);
    }

    return (
        <Input
            placeholder={`Search ${field.field}`}
            value={filterValue}
            onChange={onChange}
            style={{ marginBottom: 8, display: 'block' }}
        />
    );
}