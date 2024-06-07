import React, { useCallback, useEffect, useMemo,useState } from 'react';
import { Button,Badge,notification } from 'antd';
import {BellFilled  } from '@ant-design/icons';
import NotificationItem from './NotificationItem';
import RunNotification from './RunNotification';
import I18nLabel from '../../../../../component/I18nLabel';

const Context = React.createContext({
    itemList: [],
});

/***
 * 这里允许配置多个通知项，每个通知项可以配置不同的轮询策略
 * 需要维护一个当前运行中的通知项列表，允许动态向这个列表中增加或删除通知项
 * 每个通知项单独按照自己的轮询策略运行，缓存通知项的最新数据
 * 每个通知项的数据更新后如何通知页面刷新展示？
 */

export default function NotificationButton({getLocaleLabel,notificationConf}){
    const [api, contextHolder] = notification.useNotification();
    const [itemList, setItemList] = useState([]);
    const [runItems,setRunItems]=useState([]);

    console.log("NotificationButton",runItems)

    const removeNotificationItem=useCallback((item)=>{
        setItemList(itemList.filter((dataItem)=>dataItem.item.key!==item.item.key));
    },[itemList]);
    
    const showNotification = () => {
        api.info({
        key:"taskNotification",
        duration:0,
        message: <I18nLabel label={notificationConf.title??""}/>,
        description: <Context.Consumer>{({ itemList }) => itemList.map(item=><NotificationItem removeNotificationItem={removeNotificationItem} getLocaleLabel={getLocaleLabel} key={item.data.id} item={item}/>)}</Context.Consumer>,
        placement:'topRight'
        });
    };

    const udpateItemList=useCallback((item,list)=>{
        //更新通知项的数据,不自动删除旧的数据，只作新增和更新
        const otherItemList=itemList.filter((dataItem)=>(dataItem.item.key!==item.key||list.find((newItem)=>newItem.id===dataItem.data.id)===undefined));
        let newItemList=list.map((dataItem)=>({data:dataItem,item:item}));
        newItemList=[...newItemList,...otherItemList];
        newItemList.sort((a,b)=>a.data.update_time>b.data.update_time?-1:1);
        setItemList([...newItemList]);
    },[itemList]);

    useEffect(() => {
        if(notificationConf?.items?.length>0){
            const runItems=notificationConf.items.filter(item =>item.runStrategy?.trigger==='auto');
            setRunItems(runItems);
        }
    }, [notificationConf]);

    useEffect(()=>{
        //监听一个消息，当消息到达时，更新通知项的数据
        const activateNotification=(event)=>{
            const itemKey=event.detail.key;
            const item=notificationConf.items.find(item=>item.key===itemKey);
            const runItem=runItems.find(item=>item.key===itemKey);
            console.log("activateNotification",itemKey,item,runItem);
            if(item&&!runItem){
                setRunItems([...runItems,item]);
            }
        }
        window.addEventListener('activateNotification', activateNotification);
        return () => {
            window.removeEventListener('activateNotification', activateNotification);
        };
    },[runItems,notificationConf]);

    const contextValue = useMemo(
        () => ({
            itemList: itemList,
        }),
        [itemList],
    );

    return (
        <Context.Provider value={contextValue}>
            {contextHolder}
            <Badge count={itemList.length} size="small" offset={[-5, 15]}>
                <Button disabled={itemList.length===0} onClick={showNotification} style={{fontSize:"24px"}} type="link" icon={<BellFilled style={{fontSize:"24px"}}/>}/>
            </Badge>
            {runItems.map((item)=><RunNotification key={item.key} item={item} removeRunItem={(key)=>setRunItems(runItems.filter(item=>item.key!==key))} udpateItemList={udpateItemList}/>)}
        </Context.Provider>
    )
}