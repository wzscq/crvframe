import {useEffect} from "react";
import { useNavigate,useParams } from "react-router-dom";
import { useSelector } from 'react-redux';

import LoginForm from './LoginForm';
//import loginBackImg from "../../images/login.png";
import {getLoginImage,getAppIcon} from '../../api';

import "./index.css";

export default function Login(){
    const navigate = useNavigate();
    const token=useSelector(state=>state.login.token);
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
        if(token.length>0){
            navigate("/mainframe");
        }
    },[token,navigate]);
    
    return (
        <div className="login-page">
            <img src={loginBackImg}  alt="login.png" className="login-background" />
            <LoginForm appID={appID}/>
        </div>
    );
}