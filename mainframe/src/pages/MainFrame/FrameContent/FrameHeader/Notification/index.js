import { useSelector } from 'react-redux';
import NotificationButton from './NotificationButton';

export default function Notification({getLocaleLabel}){
    const notification=useSelector(state=>state.login?.appConf?.notification);

    if(notification?.show===true){
        return <NotificationButton getLocaleLabel={getLocaleLabel} notificationConf={notification}/>
    }

    return null;
}