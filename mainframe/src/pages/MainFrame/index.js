import { useEffect } from "react";
//import { useParams } from "react-router-dom";
//import { useDispatch } from 'react-redux';

import {
    getAppIcon,
} from '../../api';
import {userInfoStorage} from '../../utils/sessionStorage';
import Dialog from '../../dialog';
import FrameContent from "./FrameContent";
import OperationDialog from '../../operation';

import './index.css';

export default function MainFrame(){   
    useEffect(()=>{
        const {appID}=userInfoStorage.get();
        document.title=appID;
        let favicon = document.querySelector('link[rel="icon"]');
        if (favicon !== null) {
            console.log("set app icon to:",getAppIcon(appID));
            favicon.href = getAppIcon(appID);
        }
    });

    return (
        <div className="main-frame">
            <FrameContent/>
            <Dialog/>
            <OperationDialog/>
        </div>
    );
}