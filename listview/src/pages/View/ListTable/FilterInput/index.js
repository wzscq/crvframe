import {useCallback, useState} from 'react';
import { Space,Button } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import {setFieldFilter,resetFieldFilter} from '../../../../redux/dataSlice';
import { getControl } from './Controls';
import I18nLabel from '../../../../components/I18nLabel';

export default function FilterInput({sendMessageToParent,field,confirm}){
    const dispatch=useDispatch();
    const filter = useSelector(state=>state.data.views[state.data.currentView].data.filter);
    const filterValueLabel = useSelector(state=>state.data.views[state.data.currentView].data.filterValueLabel);
    const [filterValue,setFilterValue]=useState(filter[field.field]);
    const [filterLabel,setFilterLabel]=useState(filterValueLabel[field.field]);
    
    const onFilterChange=(value,label)=>{
        setFilterValue(value);
        setFilterLabel(label);
        //dispatch(setFieldFilter({[field.field]:e.target.value}));
    }

    const resetFilter=()=>{
        dispatch(resetFieldFilter(field.field));
        setFilterValue(null);
        setFilterLabel(null);
    }

    const onSearch=useCallback(()=>{
        confirm();
        dispatch(setFieldFilter({value:{[field.field]:filterValue},label:{[field.field]:filterLabel}}));
    },[field,filterValue,filterLabel,dispatch]);

    return (
    <div>
        {getControl(field,sendMessageToParent,filterValue,onFilterChange)}
        <Space style={{}}>
            <Button
                type="primary"
                onClick={onSearch}
                size="small"
                style={{ width: 90 }}
                >
                <I18nLabel label={{key:'page.crvlistview.doSearch',default:'查询'}}/>
            </Button>
            <Button
                type="primary"
                onClick={resetFilter}
                size="small"
                style={{ width: 90 }}
                >
                <I18nLabel label={{key:'page.crvlistview.resetColumnFilter',default:'重置'}}/>
            </Button>
        </Space>
    </div>);
}