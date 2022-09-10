import {useEffect} from "react";
import { useParams,useSearchParams } from "react-router-dom";

import LoginForm from './LoginForm';
import {getLoginImage,getAppIcon} from '../../api';

import "./index.css";

export default function OAuthLogin(){
    const {appID}=useParams();
    const [search, ] = useSearchParams();
    const clientID=search.get('client_id');
    const redirectUri=search.get('redirect_uri');
    const loginBackImg=getLoginImage(appID);

    useEffect(()=>{
        document.title=appID;
        let favicon = document.querySelector('link[rel="icon"]');
        if (favicon !== null) {
            console.log("set app icon to:",getAppIcon(appID));
            favicon.href = getAppIcon(appID);
        }
    },[appID]);

    return (
        <div className="login-page">
            <img src={loginBackImg}  alt="login.png" className="login-background" />
            <LoginForm appID={appID} clientID={clientID} redirectUri={redirectUri}/>
        </div>
    );
}