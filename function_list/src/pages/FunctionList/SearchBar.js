import { Input,Space,Button,Tooltip } from 'antd';
import {ReloadOutlined} from "@ant-design/icons";

import {searchFunction} from '../../redux/functionSlice';
import { useDispatch } from 'react-redux';
import useI18n from '../../hooks/useI18n';

const { Search } = Input;

export default function SearchBar({updateFunctionList}){
    const {getLocaleLabel}=useI18n();
    const dispatch=useDispatch();

    const onSearch=(value)=>{
        //alert(value);
        dispatch(searchFunction(value));
    }

    const reloadFuncList=()=>{
        updateFunctionList();
    }

    return (
        <Space className='search-bar'>
            <Search className='search-input'  placeholder={getLocaleLabel({key:'page.function.searchInputPlaceholder',default:'请输入要查询的功能关键字'})} onSearch={onSearch} enterButton />
            <Tooltip title={getLocaleLabel({key:'page.function.refreshButtonTip',default:'刷新功能列表'})}>
                <Button type='primary' icon={<ReloadOutlined />} onClick={reloadFuncList} />
            </Tooltip>
        </Space>
    )
}