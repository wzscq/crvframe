import React, { useCallback, useEffect, useMemo,useState } from 'react';
import { Button,Badge,notification,Tooltip } from 'antd';
import {BellFilled,DeleteOutlined  } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import NotificationContent from './NotificationContent';
import RunNotification from './RunNotification';
import I18nLabel from '../../../../../component/I18nLabel';
import {setOperation} from '../../../../../operation';

import './index.css';

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
    const globalFilterData=useSelector(state=>state.data.updated[Object.keys(state.data.updated)[0]]);
    const [api, contextHolder] = notification.useNotification();
    const [itemList, setItemList] = useState([]);
    const [runItems,setRunItems]=useState([]);

    const removeAllCompletedItem=useCallback(()=>{
        let newItemList=itemList.map(item=>{
            //更新通知的查看状态
            console.log('removeAllCompletedItem',item);
            if(item?.item?.updateStrategy){
                const {condition,operation}=item.item.updateStrategy;
                if(getUpdateConditionFunc(condition)(item.data)===true){
                    //执行相应的操作
                    setOperation({...operation,input:{...operation.input,selectedRowKeys:[item.data.id]}})
                    return null;
                }
            }
            return item
        });
        newItemList=newItemList.filter(item=>item!=null)
        setItemList(newItemList)
    },[itemList])

    useEffect(()=>{
        if(itemList.length<=0){
            //关闭已经打开的通知窗口
            api.destroy("taskNotification")
        }
    },[itemList])

    const removeNotificationItem=useCallback((item)=>{
        const newItemList=itemList.filter((dataItem)=>dataItem.data.id!==item.data.id||dataItem.item.key!==item.item.key)
        setItemList(newItemList);

        //更新通知的查看状态
        if(item?.item?.updateStrategy){
            const {condition,operation}=item.item.updateStrategy;
            if(getUpdateConditionFunc(condition)(item.data)===true){
                //执行相应的操作
                setOperation({...operation,input:{...operation.input,selectedRowKeys:[item.data.id]}})
            }
        }
    },[itemList,removeAllCompletedItem]);

    const getUpdateConditionFunc=(condition)=>{
        const funStr='"use strict";'+
        'return (function(record){ '+
            'try {'+
            condition+
            '} catch(e) {'+
            '   console.error(e);'+
            '   return undefined;'+
            '}'+
        '})';
        return Function(funStr)();
    }
    
    const showNotification = useCallback((duration=0) => {
        //console.log("showNotification",notificationConf,duration);
        api.info({
            key:"taskNotification",
            duration:duration,
            message: <Context.Consumer>{({ itemList,removeAllCompletedItem })=>(<div><I18nLabel label={notificationConf.title??""}/>{
                    <Tooltip zIndex={10000} title={getLocaleLabel({key:"page.main.removeAllCompletedNotificationItem",default:"删除完成的任务"})}>
                        <Button style={{float:'right'}} onClick={()=>removeAllCompletedItem(itemList)}  type="link" icon={<DeleteOutlined/>} />
                        </Tooltip>}</div>
                    )}</Context.Consumer>,
            description: <Context.Consumer>{({ itemList,removeNotificationItem }) =>(<NotificationContent itemList={itemList} getLocaleLabel={getLocaleLabel} removeNotificationItem={removeNotificationItem} />)}</Context.Consumer>,
            placement:'topRight',
            className:"mainframe-notification"
        });
        
        //触发自动更新查看状态
        /*itemList.forEach(item=>{
            if(item?.item?.updateStrategy){
                const {condition,operation}=item.item.updateStrategy;
                console.log("showNotification",condition,operation,item.data);
                if(getUpdateConditionFunc(condition)(item.data)===true){
                    //执行相应的操作
                    setOperation({...operation,input:{...operation.input,selectedRowKeys:[item.data.id]}})
                }
            }
        })*/
    },[itemList]);

    const udpateItemList=useCallback((item,list)=>{
        //更新通知项的数据，旧数据不保留
        const otherItemList=itemList.filter((dataItem)=>(dataItem.item.key!==item.key/*||list.find((newItem)=>newItem.id===dataItem.data.id)===undefined*/));
        let newItemList=list.map((dataItem)=>({data:dataItem,item:item}));
        newItemList=[...newItemList,...otherItemList];
        newItemList.sort((a,b)=>a.data.create_time>b.data.create_time?-1:1);
        setItemList([...newItemList]);
    },[itemList]);

    useEffect(() => {
        setItemList([]);
        //初始化通知项列表
        if(notificationConf?.items?.length>0){
            const runItems=notificationConf.items.filter(item =>item.runStrategy?.trigger==='auto');
            setRunItems(runItems);
        }
    }, [notificationConf,globalFilterData]);

    useEffect(()=>{
        //监听一个消息，当消息到达时，更新通知项的数据
        const activateNotification=(event)=>{
            const itemKey=event.detail.key;
            const item=notificationConf.items.find(item=>item.key===itemKey);
            const runItem=runItems.find(item=>item.key===itemKey);
            if(item&&!runItem){
                setRunItems([...runItems,item]);
            }
        }

        const showNotificationListener=(event)=>{
            const duration=event?.detail?.duration??0;
            showNotification(duration);
        }

        window.addEventListener('activateNotification', activateNotification);
        window.addEventListener('showNotification', showNotificationListener);
        return () => {
            window.removeEventListener('activateNotification', activateNotification);
            window.removeEventListener('showNotification', showNotificationListener);
        };
    },[runItems,notificationConf]);

    const contextValue = useMemo(
        () => ({
            itemList: itemList,
            removeNotificationItem:removeNotificationItem,
            removeAllCompletedItem:removeAllCompletedItem
        }),
        [itemList],
    );

    return (
        <Context.Provider value={contextValue}>
            {contextHolder}
            <Badge count={itemList.length} size="small" offset={[-5, 15]}>
                <Button disabled={itemList.length===0} onClick={()=>showNotification(notificationConf.duration??0)} style={{fontSize:"24px"}} type="link" icon={<BellFilled style={{fontSize:"20px"}}/>}/>
            </Badge>
            {runItems.map((item)=><RunNotification globalFilterData={globalFilterData} key={item.key+JSON.stringify(globalFilterData)} item={item} removeRunItem={(key)=>setRunItems(runItems.filter(item=>item.key!==key))} udpateItemList={udpateItemList}/>)}
        </Context.Provider>
    )
}