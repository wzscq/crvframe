import { useSelector,useDispatch} from "react-redux";
import { SyncOutlined,UpSquareOutlined,UpOutlined,DownOutlined} from '@ant-design/icons';
import { Button,Tooltip} from 'antd';
import { useNavigate } from "react-router-dom";

import SystemMenu from './SystemMenu';
import FilterForm from './FilterForm';

import SelectLanguage from '../../../../component/SelectLanguage';
import {userInfoStorage} from '../../../../utils/sessionStorage';
import useI18n from '../../../../hook/useI18n';
import { setHeaderVisible,setTabHeaderVisible } from '../../../../redux/layoutSlice';

import './index.css';

export default function FrameHeader({hideHeader,filterFormConf,systemMenu}){
    const dispatch=useDispatch();
    const {getLocaleLabel}=useI18n();
    const {appID}=userInfoStorage.get();
    const {current}=useSelector(state=>state.operation);
    const {menuGroups,appConf}=useSelector(state=>state.login);
    const navigate = useNavigate();
    const {headerVisible}=useSelector(state=>state.layout);

    let headerContent=(
        <>
            <div>
                {menuGroups && menuGroups.length>1?
                    <Tooltip title={getLocaleLabel({key:'page.main.exitMenuGroup',default:'退出当前菜单组'})}>
                        <Button type="link" onClick={()=>navigate("/menugroup")} icon={<UpSquareOutlined/>}/>
                    </Tooltip>:null
                }
                {
                    appConf?.showHideHeaderButton===true?(<Button type="link" onClick={()=>{dispatch(setHeaderVisible(!headerVisible));dispatch(setTabHeaderVisible(!headerVisible));}} icon={headerVisible===true?<UpOutlined/>:<DownOutlined/>}/>):null
                }
            </div>
            <div className="frame-header-filter-form">
                <FilterForm filterFormConf={filterFormConf}/>
            </div>
            <div>
                <SystemMenu systemMenu={systemMenu}/>
            </div>
            <div>
                <SelectLanguage appID={appID}/>
            </div>
            <div>
                <Button type="link" loading={current?true:false} icon={current?<SyncOutlined/>:null}/>
            </div>
        </>
    )

    if(hideHeader===true){
        headerContent=null;
    }

    let headerClassName="frame-header-normal";
    if(headerVisible===false){
        headerClassName="frame-header-invisible";
    }

    if(hideHeader===true){
        headerClassName="frame-header-hidden";
    }
    
    return (
        <div className={headerClassName}>  
            {headerContent}
        </div>
    );
}