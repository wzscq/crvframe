import React, { useCallback, useEffect, useMemo,useState } from 'react';
import { Button,Badge,notification } from 'antd';
import {BellFilled  } from '@ant-design/icons';
import TaskItem from './NotificationItem';

const Context = React.createContext({
    itemList: [],
});

var index=0;

export default function NotificationButton({notificationConf}){
    const [api, contextHolder] = notification.useNotification();
    const [itemList, setItemList] = useState([]);
    
    const showNotification = () => {
        api.info({
        key:"taskNotification",
        duration:0,
        message: `任务状态通知`,
        description: <Context.Consumer>{({ itemList }) => itemList.map(item=><TaskItem key={item.id} item={item}/>)}</Context.Consumer>,
        placement:'topRight'
        });
    };

    const udpateItemList=useCallback((key,list)=>{
        const otherItemList=itemList.filter((dataItem)=>dataItem.typeKey!==key);
        const newItemList=list.map((dataItem)=>({...dataItem,typeKey:key}));
        newItemList=[...newItemList,...otherItemList];
        newItemList.sort((a,b)=>a.update_time>b.update_time?-1:1);
        setItemList([...newItemList]);
    },[itemList,setItemList]);

    useEffect(() => {
        if(notificationConf?.items?.length>0){
            notificationConf.items.forEach(item => {
                if(item.runStrategy?.trigger==='auto'){
                    //runNotification(item);
                }
            })
        }
    }, [notificationConf]);

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
        </Context.Provider>
    )
}