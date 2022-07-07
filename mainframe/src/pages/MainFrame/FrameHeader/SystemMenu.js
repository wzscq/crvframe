import { Menu, Dropdown,Avatar} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

import {DIALOG_TYPE} from '../../../dialog';
import {
    createOpenOperation,
    createLogoutOperation,
    setOperation,
    OPEN_LOCATION
} from '../../../operation';
import useI18n from '../../../hook/useI18n';

export default function SystemMenu(){
    const {getLocaleLabel}=useI18n();
    const userName=useSelector(state=>state.login.userName);

    const handleClick=(e)=>{
        if(e.key==="logout"){
            logoutFunc();
        }
        if(e.key==="changePassword"){
            changePassword();
        }
    }

    const logoutFunc=()=>{
        let operationItem=createLogoutOperation();
        setOperation(operationItem);
    }

    const changePassword=()=>{
        //通过打开对话框操作打开修改密码窗口
        //输入就是当前登录用户ID
        let operationItem=createOpenOperation(
            {
                url:DIALOG_TYPE.CHANGE_PASSWORD,
                location:OPEN_LOCATION.MODAL
            },{},getLocaleLabel({key:'page.main.openChangePasswordDialog',default:'打开修改用户密码对话框'}));
        setOperation(operationItem);
    }

    const menuItems=[
        {key:'logout',label:getLocaleLabel({key:'page.main.logout',default:'退出登录'})},
        {key:'changePassword',label:getLocaleLabel({key:'page.main.changePassword',default:'修改密码 ...'})}
    ];

    const menu = (
        <Menu onClick={handleClick} items={menuItems}/>
    );

    return (
        <Dropdown overlay={menu} placement="bottomLeft" arrow>
            <div>
                <Avatar style={{ backgroundColor: '#096dd9' }} icon={<UserOutlined />} />
                <span style={{padding:10}}>{userName}</span>
            </div>
        </Dropdown>
    );
}