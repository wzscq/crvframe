import { FilterFilled } from '@ant-design/icons';
import { useSelector } from "react-redux";

export default function FilterIcon({field}){
    const {filter}=useSelector(state=>state.data.views[state.data.currentView].data);

    return (
        <FilterFilled style={{ color:  filter[field.field]? '#1890ff' : undefined }} />
    )
}