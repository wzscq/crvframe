
import {Image} from 'antd';

import SystemMenu from './SystemMenu';
import SelectLanguage from '../../../component/SelectLanguage';
import {userInfoStorage} from '../../../utils/sessionStorage';
import {getMenuGroupHeaderImage} from '../../../api';

import './index.css';

export default function Header({systemMenu}){
    const {appID}=userInfoStorage.get();
  
    return (
        <div className="menugroup-frame-header">
            <Image  preview={false} height={"45px"} src={getMenuGroupHeaderImage()} />  
            <div className='locale-selector'>
                <SelectLanguage appID={appID}/>
            </div>
            <div className="system-menu">
                <SystemMenu systemMenu={systemMenu}/>
            </div>
        </div>
    );
}