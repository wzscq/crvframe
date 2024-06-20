import NotificationItem from "./NotificationItem"

export default function NotificationContent({itemList,removeNotificationItem,getLocaleLabel}){
    console.log("NotificationContent",itemList)
    return (
        <div style={{width:"100%",maxHeight:"calc(100vh - 140px)",overflowY:"auto",overflowX:"hidden"}}>
            {itemList.map(item=><NotificationItem removeNotificationItem={removeNotificationItem} getLocaleLabel={getLocaleLabel} key={item.data.id} item={item}/>)}
        </div>
    )
}