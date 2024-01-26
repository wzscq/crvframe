import { useSelector} from "react-redux";
import { SyncOutlined,UpSquareOutlined} from '@ant-design/icons';
import { Button,Tooltip} from 'antd';
import { useNavigate } from "react-router-dom";

import FunctionMenu from './FunctionMenu';
import SystemMenu from './SystemMenu';
import FilterForm from './FilterForm';

import SelectLanguage from '../../../../component/SelectLanguage';
import {userInfoStorage} from '../../../../utils/sessionStorage';
import useI18n from '../../../../hook/useI18n';

import './index.css';

export default function FrameHeader({hideHeader,filterFormConf,systemMenu}){
    const {getLocaleLabel}=useI18n();
    const {appID}=userInfoStorage.get();
    const {current}=useSelector(state=>state.operation);
    const {menuGroups}=useSelector(state=>state.login);
    const navigate = useNavigate();

    return (
        <div className="frame-header" style={hideHeader===true?{height:0,overflow:'hidden'}:{}}>
            <div className="function-menu">
                <FunctionMenu/>
            </div>
            <div className="system-operation-bar">
                <Button type="text" loading={current?true:false} icon={<SyncOutlined/>}/>
            </div>
            <div className='locale-selector'>
                <SelectLanguage appID={appID}/>
            </div>
            {
                menuGroups && menuGroups.length>1?
                <div className="menu-group">
                    <Tooltip title={getLocaleLabel({key:'page.main.exitMenuGroup',default:'退出当前菜单组'})}>
                        <Button type="text" onClick={()=>navigate("/menugroup")} icon={<UpSquareOutlined/>}/>
                    </Tooltip>
                </div>:null
            }
            <div className="system-menu">
                <SystemMenu systemMenu={systemMenu}/>
            </div>
            <div className="filter-form">
                <FilterForm filterFormConf={filterFormConf}/>
            </div>
        </div>
    );
}