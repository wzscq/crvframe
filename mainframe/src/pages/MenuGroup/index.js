import {useEffect} from 'react';
import { useSelector,useDispatch } from 'react-redux';

import {getAppI18n} from '../../api';
import {localeStorage} from '../../utils/localStorage';
import {userInfoStorage} from '../../utils/sessionStorage';
import GroupItem from './GroupItem';
import Header from './Header';
import Dialog from '../../dialog';
import OperationDialog from '../../operation';
import './index.css';

export default function MenuGroup() {
  const dispatch=useDispatch();
  const {menuGroups}=useSelector(state=>state.login);
  const {locale,loaded}=useSelector(state=>state.i18n);

  useEffect(()=>{
    const {appID}=userInfoStorage.get();
    const getDefaultLocale=()=>{
        //默认语言首先从浏览器本地缓存中获取，如果本地缓存中不存在则取浏览器的默认语言类型
        let locale=localeStorage.get(appID);
        if(!locale){
            locale=navigator.language||navigator.userLanguage;
        }
        return locale;
    }
    //加载APP对应的语言资源信息
    if(loaded===false){
        if(locale){
            dispatch(getAppI18n({appID,locale}));
        } else {
            dispatch(getAppI18n({appID,locale:getDefaultLocale()}));
        }
    }
  },[locale,loaded,dispatch]);

  const groupsItems=menuGroups.map((item,index)=>{
    return (<GroupItem item={item} key={item.id} index={index}/>);
  });

  return (
    <div className='menu-group-main'>
      <Header/>
      <div className='menu-group-content'>
        {groupsItems}
      </div>
      <Dialog/>
      <OperationDialog/>
    </div>
  );
}