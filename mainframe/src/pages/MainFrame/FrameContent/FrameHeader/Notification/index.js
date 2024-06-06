import { useSelector } from 'react-redux';
import NotificationButton from './NotificationButton';

export default function Notification(){
    const notification=useSelector(state=>state.login?.appConf?.notification);

    if(notification?.show===true){
        return <NotificationButton notificationConf={notification}/>
    }

    return null;
}