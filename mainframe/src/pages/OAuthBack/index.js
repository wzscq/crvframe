import {useEffect} from "react";
import { useParams,useSearchParams,useNavigate } from "react-router-dom";
import { useDispatch,useSelector } from 'react-redux';
import {getLoginImage,getAppIcon,oauthBackApi} from '../../api';

import './index.css';

export default function OAuthBack(){
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token=useSelector(state=>state.login.token);
    const {appID}=useParams();
    const [search,] = useSearchParams();
    const oauthCode=search.get('code');
    const loginBackImg=getLoginImage(appID);
 
    useEffect(()=>{
        document.title=appID;
        let favicon = document.querySelector('link[rel="icon"]');
        if (favicon !== null) {
            //console.log("set app icon to:",getAppIcon(appID));
            favicon.href = getAppIcon(appID);
        }
    },[appID]);

    //这里走实际的auth登录，根据code获取token和用户信息
    useEffect(()=>{
        if(token.length>0){
            navigate("/mainframe");
        } else {
            console.log('oauth:',appID,oauthCode);
            dispatch(oauthBackApi({appID:appID,oauthCode:oauthCode}));
        }
    },[dispatch,navigate,token,appID,oauthCode]);

    return (
        <div className="auth-back-page">
            <img src={loginBackImg}  alt="login.png" className="login-background" />
        </div>
    );
}