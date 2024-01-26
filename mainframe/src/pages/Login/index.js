import {useEffect} from "react";
import { useNavigate,useParams } from "react-router-dom";
import { useSelector,useDispatch } from 'react-redux';

import LoginForm from './LoginForm';
//import loginBackImg from "../../images/login.png";
import {getLoginImage,getAppIcon,getAppI18n} from '../../api';
import {localeStorage} from '../../utils/localStorage';

import "./index.css";

export default function Login(){
    const navigate = useNavigate();
    const dispatch=useDispatch();
    const {token,menuGroups}=useSelector(state=>state.login);
    const {locale,loaded}=useSelector(state=>state.i18n);
    const {appID}=useParams();
    const loginBackImg=getLoginImage(appID);

    useEffect(()=>{
        document.title=appID;
        let favicon = document.querySelector('link[rel="icon"]');
        if (favicon !== null) {
            console.log("set app icon to:",getAppIcon(appID));
            favicon.href = getAppIcon(appID);
        }
    },[appID]);

    useEffect(()=>{
        const getDefaultLocale=()=>{
            //默认语言首先从浏览器本地缓存中获取，如果本地缓存中不存在则取浏览器的默认语言类型
            let locale=localeStorage.get(appID);
            if(!locale){
                locale=navigator.language||navigator.userLanguage;
            }
            return locale;
        }
        //加载APP对应的语言资源信息
        if(loaded===false){
            if(locale){
                dispatch(getAppI18n({appID,locale}));
            } else {
                dispatch(getAppI18n({appID,locale:getDefaultLocale()}));
            }
        }
    },[locale,loaded,appID,dispatch]);

    useEffect(()=>{
        if(token.length>0){
            if(menuGroups?.length>1){
                navigate("/menugroup");
                return;
            }
            
            if(menuGroups?.length===1){
                navigate("/mainframe/"+menuGroups[0].id);
                return;
            }

            navigate("/mainframe/menus");
        }
    },[token,menuGroups,navigate]);
    
    return (
        <div className="login-page">
            <img src={loginBackImg}  alt="login.png" className="login-background" />
            <LoginForm appID={appID}/>
        </div>
    );
}