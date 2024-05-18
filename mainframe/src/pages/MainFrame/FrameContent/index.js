import { useState,useEffect } from "react";
import { SplitPane } from "react-collapse-pane";
import { useDispatch, useSelector } from 'react-redux';
import FrameTab from './FrameTab';
import MenuBar from "./MenuBar";
import FrameHeader from './FrameHeader';
import {localeStorage} from '../../../utils/localStorage';
import {userInfoStorage} from '../../../utils/sessionStorage';
import { getAppI18n } from '../../../api';
import {
    setOperation
} from '../../../operation';

export default function FrameContent({menuGroup}){   
    const [menuCollapsed,setMenuCollapsed]=useState(false);
    const [inResize,setInResize]=useState(false);
    const {locale,loaded}=useSelector(state=>state.i18n);
    const {initOperations,appConf}=useSelector(state=>state.login);
    const {headerVisible}=useSelector(state=>state.layout);
    const dispatch=useDispatch();

    useEffect(()=>{
        const {appID}=userInfoStorage.get();
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
    },[locale,loaded,dispatch]);

    useEffect(()=>{
        if(Array.isArray(initOperations) && initOperations.length>0){
            initOperations.forEach(element => {
                setOperation(element);
            });
        }
    },[initOperations]);
    
    const hooks={
        onDragStarted:()=>{
            console.log('onDragStarted...');
            setInResize(true);
        },
        onSaveSizes:()=>{
            console.log('onSaveSizes...');
            setInResize(false);
        },
        onCollapse:(collapsedSizes)=>{
            if(collapsedSizes[0]!==null){
                setMenuCollapsed(true);
            } else {
                setMenuCollapsed(false);
            }
        }
    }

    const collapseOptions={
        collapsedSize: 45,
        collapseTransitionTimeout:50
    }

    const hideMenu=appConf?.hideMenu;
    const hideHeader=appConf?.hideHeader;
    const systemMenu=appConf?.systemMenu;

    let frameContent=(
        <div style={{height:'100%',position:'relative'}}>
            <FrameHeader filterFormConf={appConf?.filterForm} systemMenu={systemMenu}/>
            <div style={{width:'100%',height:headerVisible===false?'calc(100%)':'calc(100% - 45px)',position:'relative'}}>
                <FrameTab inResize={inResize} />
            </div>
        </div>
    );

    if(hideHeader===true){
        frameContent=(<FrameTab inResize={inResize} />);
    }

    if(hideMenu===true){
        return (
        <div className="content">
            {frameContent}
        </div>);
    }

    return (
        <div className="content">
            <SplitPane collapse={collapseOptions} hooks={hooks} dir='ltr' minSizes={[45,200]} initialSizes={[15,85]} split="vertical" >
                <MenuBar collapsed={menuCollapsed} menuGroup={menuGroup}/>
                {frameContent}
            </SplitPane>
        </div>);
}