import { useSelector} from "react-redux";
import { SyncOutlined } from '@ant-design/icons';
import { Button} from 'antd';

import FunctionMenu from './FunctionMenu';
import SystemMenu from './SystemMenu';
import FilterForm from './FilterForm';

import SelectLanguage from '../../../../component/SelectLanguage';
import {userInfoStorage} from '../../../../utils/sessionStorage';

import './index.css';

export default function FrameHeader({hideHeader,filterFormConf}){
    const {appID}=userInfoStorage.get();
    const {current}=useSelector(state=>state.operation);

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
            <div className="system-menu">
                <SystemMenu/>
            </div>
            <div className="filter-form">
                <FilterForm filterFormConf={filterFormConf}/>
            </div>
        </div>
    );
}