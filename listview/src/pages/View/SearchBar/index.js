import {useMemo,useCallback} from 'react';
import { Input, Space, Button,Tooltip } from 'antd';
import { StopOutlined,SyncOutlined } from '@ant-design/icons';
import { useDispatch,useSelector } from "react-redux";
import { refreshData,setFilter } from '../../../redux/dataSlice';

import './index.css';
import useI18n from '../../../hooks/useI18n';

const { Search } = Input;

export default function SearchBar(){
    const {getLocaleLabel}=useI18n();
    const {fields,views}=useSelector(state=>state.definition);
    const {currentView} = useSelector(state=>state.data);
    const dispatch=useDispatch();

    const quickSearchFields=useMemo(()=>{
        const viewConf=views.find(item=>item.viewID===currentView);
        if(viewConf&&viewConf.fields){
            return fields.filter(item=>
                item.quickSearch&&
                viewConf.fields.find(viewItem=>viewItem.field===item.field)
            ).map(field=>field.field)
        }
        return [];
    },[fields,views,currentView]);

    const onSearch=useCallback((value)=>{
        if(quickSearchFields.length>0){
            const fieldsFilter=quickSearchFields.map(element => {
                const tempFieldFilter={};
                tempFieldFilter[element]='%'+value+'%';
                return tempFieldFilter;
            });
            const op='Op.or';
            dispatch(setFilter({[op]:fieldsFilter}));
        }
    },[quickSearchFields,dispatch]);

    const reset=()=>{
        dispatch(setFilter({}));
    }

    const refresh=()=>{
        dispatch(refreshData());
    }

    return (
        <div className='search-bar'>
            <Space>
                <Search placeholder={getLocaleLabel({key:'page.crvlistview.searchInputPlaceholder',default:'input search text'})} onSearch={onSearch}/>
                <Tooltip title={getLocaleLabel({key:'page.crvlistview.resetFilter',default:'重置查询条件'})}>
                    <Button
                        type="primary"
                        icon={<StopOutlined />}
                        loading={false}
                        onClick={reset}
                    />
                </Tooltip>
                <Tooltip title={getLocaleLabel({key:'page.crvlistview.refresh',default:'刷新'})}>
                    <Button
                        type="primary"
                        icon={<SyncOutlined />}
                        loading={false}
                        onClick={refresh}
                    />
                </Tooltip>
            </Space>
        </div>
    )
}