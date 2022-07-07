import { Card,Form,Input,Button } from 'antd';
import { useSelector,useDispatch } from 'react-redux';

import SelectLanguage from '../../component/SelectLanguage';
import {encodePassword} from '../../utils/passwordEncoder';
import {loginApi} from '../../api';
import useI18n from '../../hook/useI18n';

import './LoginForm.css';

export default function LoginForm({appID}){
    const pending=useSelector(state=>state.login.pending);
    const dispatch = useDispatch();
    const {getLocaleLabel}=useI18n();

    const onFinish = (values) => {
        //提交账号密码，获取用户token
        const loginParam={...values,password:encodePassword(values.password),appID:appID};
        dispatch(loginApi(loginParam));
    };
    
    const onFinishFailed = (errorInfo) => {
        
    };

    return (
        <div className='login-form'>
            <Card title={getLocaleLabel({key:'page.login.login',default:'登录'})} extra={<SelectLanguage appID={appID}/>}>
                <Form
                    name='basic'
                    layout='vertical'
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    >
                    <Form.Item
                        label={getLocaleLabel({key:'page.login.account',default:'账号'})}
                        name='userId'
                        rules={[{ required: true, message: '请输入登录账号!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label={getLocaleLabel({key:'page.login.password',default:'密码'})}
                        name='password'
                        rules={[{ required: true, message: '请输入密码!' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 7, span: 0 }}>
                        <Button className='login-confirm-button' loading={pending} type='primary' htmlType='submit' >{getLocaleLabel({key:'page.login.submit',default:'确定'})}</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}