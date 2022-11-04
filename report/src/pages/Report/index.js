import { useParams } from 'react-router-dom';
import {useEffect, useMemo} from 'react';
import {useSelector} from 'react-redux';

import useFrame from "../../hook/useFrame";
import {createGetReportConfMessage} from '../../utils/normalOperations';
import PageLoading from '../../components/PageLoading';
import Chart from './Chart';

import './index.css';

export default function Report(){
    const {reportID}=useParams();
    const {origin,item}=useSelector(state=>state.frame);
    const {loaded,reportConf} = useSelector(state=>state.definition);
    const sendMessageToParent=useFrame();

    const frameParams=useMemo(()=>{
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
        if(frameParams!==null){
            if(loaded===false){
                sendMessageToParent(createGetReportConfMessage(frameParams,reportID));
            }
        }
    },[loaded,reportID,frameParams,sendMessageToParent]);

    if(loaded===false){
        return (<PageLoading/>);
    }

    const {colCount,rowHeight}=reportConf;
    const controls=reportConf.controls.map(item=>{
        return (<Chart key={item.id} frameParams={frameParams} controlConf={item} reportID={reportID} sendMessageToParent={sendMessageToParent} />);
    });

    return (
        <div className='layout-grid' style={{gridTemplateColumns: "repeat("+colCount+", 1fr)",gridAutoRows:"minmax("+rowHeight+"px, auto)"}}>
            {controls}
        </div>
    );
}