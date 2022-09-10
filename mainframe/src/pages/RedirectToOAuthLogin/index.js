import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { 
    getOAuthLoginPage,
    getLoginImage 
} from "../../api";

import './index.css';

export default function RedirectToOAuthLogin(){
    const {appID}=useParams();
    const {oauthLoginPage,loaded} = useSelector(state=>state.oauth);
    const loginBackImg=getLoginImage(appID);
    const dispatch=useDispatch();
    //直接跳转到OAuth登录页面
    useEffect(()=>{
        if(loaded===false){
            dispatch(getOAuthLoginPage({appID:appID}));
        }
    },[dispatch,loaded,appID]);

    useEffect(()=>{
        if(oauthLoginPage!==null){
            console.log(oauthLoginPage);
            window.location=oauthLoginPage;
        }
    },[oauthLoginPage]);

    return (
        <div className="redirect-oauth">
            <img src={loginBackImg}  alt="login.png" className="background-img" />
        </div>
    );
}