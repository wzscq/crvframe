import { useParams } from 'react-router-dom';
import {useEffect, useMemo } from 'react';
import {useSelector} from 'react-redux';
import { ConfigProvider } from 'antd';

import useFrame from "../../hook/useFrame";
import useI18n from '../../hook/useI18n';
import {createGetReportConfMessage} from '../../utils/normalOperations';
import PageLoading from '../../components/PageLoading';
import {getControl}  from './controls';
import Header from './Header';

import './index.css';

export default function Report(){
    const {locale,getLocaleLabel}=useI18n();
    const {reportID}=useParams();
    const {origin,item}=useSelector(state=>state.frame);
    const {loaded,reportConf} = useSelector(state=>state.definition);

    const sendMessageToParent=useFrame();

    const frameParams=useMemo(()=>{
        console.log(origin,item);
        if(origin&&item){
            return ({
                frameType:item.frameType,
                frameID:item.params.key,
                origin:origin
            });
        }
        return null;
        },
    [origin,item]);
    //加载配置
    useEffect(()=>{
        console.log(frameParams,loaded);
        if(frameParams!==null){
            if(loaded===false){
                sendMessageToParent(createGetReportConfMessage(frameParams,reportID));
            }
        }
    },[loaded,reportID,frameParams,sendMessageToParent]);

    if(loaded===false){
        return (<PageLoading/>);
    }

    const {colCount,rowHeight,theme}=reportConf;
    const controls=reportConf.controls.map(item=>{
        console.log('control:',item);
        return getControl(item,frameParams,reportID,sendMessageToParent,locale,theme);
        /*if(item.controlType==='EChart'){
            return (<Chart key={item.id} frameParams={frameParams} controlConf={item} reportID={reportID} sendMessageToParent={sendMessageToParent} />);
        }*/
    });

    const wrapperStyle=theme?.wrapper?.style??{};

    if(theme?.antd){
        return (
            <ConfigProvider theme={theme.antd}>
                <div style={{width:'100vw',height:'100vh',...wrapperStyle}}>
                    <Header locale={locale} getLocaleLabel={getLocaleLabel} headerButtons={reportConf.headerButtons}  filterFormConf={reportConf.filterForm} sendMessageToParent={sendMessageToParent}/>
                    <div className='layout-grid' style={{gridTemplateColumns: "repeat("+colCount+", 1fr)",gridAutoRows:"minmax("+rowHeight+"px, auto)"}}>
                        {controls}
                    </div>
                </div>
            </ConfigProvider>
        );
    }

    return (
        <div style={{width:'100vw',height:'100vh',...wrapperStyle}}>
            <Header locale={locale} getLocaleLabel={getLocaleLabel} headerButtons={reportConf.headerButtons}  filterFormConf={reportConf.filterForm} sendMessageToParent={sendMessageToParent}/>
            <div className='layout-grid' style={{gridTemplateColumns: "repeat("+colCount+", 1fr)",gridAutoRows:"minmax("+rowHeight+"px, auto)"}}>
                {controls}
            </div>
        </div>
    );
}