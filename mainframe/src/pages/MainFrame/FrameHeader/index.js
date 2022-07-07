import FunctionMenu from './FunctionMenu';
import SystemMenu from './SystemMenu';

import SelectLanguage from '../../../component/SelectLanguage';
import {userInfoStorage} from '../../../utils/sessionStorage';
import OperationDialog from '../../../operation';
import Logo from './Logo';
import './index.css';

export default function FrameHeader(){
    const {appID}=userInfoStorage.get();

    return (
        <div className="frame-header">
            <div className="logo">
                <Logo/>
            </div>
            <div className="function-menu">
                <FunctionMenu/>
            </div>
            <div className="system-operation-bar">
                <OperationDialog/>
            </div>
            <div className='locale-selector'>
                <SelectLanguage appID={appID}/>
            </div>
            <div className="system-menu">
                <SystemMenu/>
            </div>
        </div>
    )
}