import { useParams } from 'react-router-dom';
import {useEffect} from 'react';
import {useSelector} from 'react-redux';

import useFrame from "../../hook/useFrame";
import {createGetReportConfMessage} from '../../utils/normalOperations';

export default function Report(){
    const {reportID}=useParams();
    const {origin,item}=useSelector(state=>state.frame);
    const {loaded,reportConf} = useSelector(state=>state.definition);
    const sendMessageToParent=useFrame();

    //加载配置
    useEffect(()=>{
        if(origin&&item){
            if(loaded===false){
                const frameParams={
                    frameType:item.frameType,
                    frameID:item.params.key,
                    origin:origin};
                sendMessageToParent(createGetReportConfMessage(frameParams,reportID));
            }
        }
    },[loaded,reportID,origin,item,sendMessageToParent]);

    return (
        <div>report:{JSON.stringify(reportConf)}</div>
    );
}