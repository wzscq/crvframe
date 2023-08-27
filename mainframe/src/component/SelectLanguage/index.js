import {GlobalOutlined,LoadingOutlined,CheckOutlined} from '@ant-design/icons';
import { Menu, Dropdown,Spin,Button } from 'antd';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getAppI18n } from '../../api';
import {localeStorage} from '../../utils/localStorage';

export default function SelectLanguage({appID}){
    const {locale,loading,locales}=useSelector(state=>state.i18n);
    const dispatch=useDispatch();

    const switchLocale=useCallback(({key})=>{
        //将选择的语言项缓存
        if(locale!==key){
            localeStorage.set(appID,key);
            dispatch(getAppI18n({appID,locale:key}));
        }
    },[locale,appID,dispatch]);

    const menu = (
        <Menu
          items={locales.map(item=>({...item,icon:<CheckOutlined style={{opacity:item.key===locale?1:0}}/>}))}
          //items={locales}
          onClick={switchLocale}
          selectable={true}
          selectedKeys={[locale]}
        />
    );

    console.log('selectlangue:'+JSON.stringify(locales));

    const antIcon = <LoadingOutlined style={{ fontSize: 20 }} spin />;
    
    if(loading){
        return (<Spin indicator={antIcon} />);
    }

    if(locales.length<=1){
        return null;
    }

    return (
        <Dropdown overlay={menu} placement="bottomRight" arrow={{ pointAtCenter: true }}>
            <Button type='link'><GlobalOutlined /></Button>
        </Dropdown>
    );
}