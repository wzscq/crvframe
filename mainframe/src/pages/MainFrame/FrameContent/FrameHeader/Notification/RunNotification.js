import { useEffect,useState } from "react"
import {getQueryDataPromise} from '../../../../../api';

/**
 * 单个通知项的轮询处理
 * 
 *  
 */
export default function RunNotification({item,removeRunItem,udpateItemList,globalFilterData}){
    const [localData,setLocalData]=useState({runTime:0,emptyTime:0});
    const [itemList,setItemList]=useState([]);

    console.log("RunNotification111",item.key,localData,globalFilterData);

    useEffect(()=>{
        /** 
         * 当数据列表发生变化时，更新通知项的数据,没有数据时不做更新
         */
        //if(itemList.length>0){
            //console.log("RunNotification udpateItemList",item.key);
            udpateItemList(item,itemList);
        //}
    },[itemList]);

    useEffect(()=>{
        /*
        当runTime发生变化时，执行数据获取操作
        */
        let timer=null;
        console.log("RunNotification getQueryDataPromise",item.key);
        getQueryDataPromise({queryParams:{...item.data,globalFilterData}}).then((reponse)=>{
            const interval=item.runStrategy?.interval||10000;
            console.log("RunNotification list",reponse.data.result?.list)
            //更新数据
            if(reponse.data.result?.list?.length>0){
                setItemList([...reponse.data.result.list]);
                //继续轮询
                console.log("RunNotification setLocalData",item.key,interval);
                const {runTime}=localData;
                timer=setTimeout(()=>{setLocalData({runTime:runTime+1,emptyTime:0})},interval);
            } else {
                setItemList([]);
                const {runTime,emptyTime}=localData;
                //判断是否需要继续轮询
                const retryTimesBeforeStop=item.runStrategy?.retryTimesBeforeStop||0;
                if(retryTimesBeforeStop>emptyTime||item.runStrategy?.stopWhenItemsEmpty===false){
                    //继续轮询
                    timer=setTimeout(()=>{setLocalData({runTime:runTime+1,emptyTime:emptyTime+1})},interval);
                } else {
                    //停止轮询
                    removeRunItem(item.key);
                }
            }
        });
        return ()=>{
            if(timer!==null){
                clearTimeout(timer);
            }
        };
    },[localData,globalFilterData])
    
    return (<></>)
}