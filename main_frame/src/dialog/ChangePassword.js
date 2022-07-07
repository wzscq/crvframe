import { Form,Input,Button } from 'antd';

import {encodePassword} from '../utils/passwordEncoder';
import {DIALOG_TYPE} from '../dialog';
import {
    createCloseOperation,
    createRequestOperation,
    setOperation,
    OPEN_LOCATION} from '../operation';
import useI18n from '../hook/useI18n';

const CHANGE_PASSWORD_URL="/frameservice/user/changePassword"; 

export default function ChangePassword(){
    const {getLocaleLabel}=useI18n();

    const onFinish=(values)=>{
        const input={
            password:encodePassword(values.password),
            newPassword:encodePassword(values.newPassword)
        }
        
        let requestItem=createRequestOperation(
            {
                url:CHANGE_PASSWORD_URL,
                method:"post"
            },
            input,
            getLocaleLabel({key:'dialog.changePassword.sendRequest',default:'提交修改密码请求'})
        );
        
        const closeItem=createCloseOperation(
            {
                url:DIALOG_TYPE.CHANGE_PASSWORD,
                location:OPEN_LOCATION.MODAL
            },
            {},
            getLocaleLabel({key:'dialog.changePassword.closeOperation',default:'关闭密码修改对话框'})
        );

        requestItem.successOperation=closeItem;
        setOperation(requestItem);
    }

    const handleCancel=()=>{
        const closeItem=createCloseOperation(
            {
                url:DIALOG_TYPE.CHANGE_PASSWORD,
                location:OPEN_LOCATION.MODAL
            },{},getLocaleLabel({key:'dialog.changePassword.closeOperation',default:'关闭密码修改对话框'}));
        setOperation(closeItem);
    }

    const onFinishFailed=()=>{

    }

    return (
        <Form
            name="basic"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            >

            <Form.Item
                label={getLocaleLabel({key:'dialog.changePassword.password',default:'原密码'})}
                name="password"
                rules={[{ required: true, message: getLocaleLabel({key:'dialog.changePassword.passwordTip',default:'请输入原密码!'})}]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                label={getLocaleLabel({key:'dialog.changePassword.newPassword',default:'新密码'})}
                name="newPassword"
                rules={[{ required: true, message: getLocaleLabel({key:'dialog.changePassword.newPasswordTip',default:'请输入新密码!'}) }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                label={getLocaleLabel({key:'dialog.changePassword.newPasswordAgain',default:'请再次输入新密码'})}
                name="passwordConfirm"
                rules={[
                    { required: true, message: getLocaleLabel({key:'dialog.changePassword.newPasswordAgainTip',default:'请再次输入新密码进行确认!'})},
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error(getLocaleLabel({key:'dialog.changePassword.passwordNotEqual',default:'两次输入的密码不一致!'})));
                      },
                    }),
                ]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item>
                <Button style={{marginRight:0,width:140,float:"right"}} loading={false} type="primary" htmlType="submit">
                    {getLocaleLabel({key:'dialog.changePassword.confirm',default:'确定'})}
                </Button>
                <Button style={{marginRight:10,width:140,float:"right"}} onClick={handleCancel}>
                    {getLocaleLabel({key:'dialog.changePassword.cancel',default:'取消'})}
                </Button>
            </Form.Item>
        </Form>
    )
}