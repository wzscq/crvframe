import { useEffect,useState } from "react"
import {getQueryDataPromise} from '../../../../../api';

export default function RunNotification({item,removeRunItem,udpateItemList}){
    const [runTime,setRunTime]=useState({runTime:0,emptyTime:0});
    const [itemList,setItemList]=useState([]);

    useEffect(()=>{
        udpateItemList(item.key,itemList);
    },[itemList]);

    useEffect(()=>{
        
    },[runTime]);

    useEffect(()=>{
        getQueryDataPromise({queryParams:item.data}).then((reponse)=>{
            //更新数据
            if(reponse.data.Result?.list?.length>0){
                setItemList([...reponse.data.Result.list]);
                //继续轮询
                const interval=item.runStrategy?.interval||10000;
                const {runTime,emptyTime}=runTime;
                setTimeout(()=>{setRunTime({runTime:runTime+1,emptyTime:0})},interval);
            } else {
                setItemList([]);
                const emptyTime=item._emptyTime||0;
                //判断是否需要继续轮询
                const retryTimesBeforeStop=item.runStrategy?.retryTimesBeforeStop||0;
                if(retryTimesBeforeStop>emptyTime||item.runStrategy?.stopWhenItemsEmpty===false){
                    //继续轮询
                    const interval=item.runStrategy?.interval||10000;
                    setTimeout(()=>runNotification({...item,_emptyTime:emptyTime+1}),interval);
                } else {
                    //停止轮询
                    removeRunItem(item.key);
                }
            }
        });
    },[item,runTime])
    
    return (<></>)
}