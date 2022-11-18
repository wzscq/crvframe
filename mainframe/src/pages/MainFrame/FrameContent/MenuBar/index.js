import {Menu} from 'antd';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as IconList from '@ant-design/icons';

import { getUserMenus } from '../../../../api';
import { setOperation } from '../../../../operation';
import useI18n from '../../../../hook/useI18n';

import Logo from './Logo';

import './index.css';

export default function MenuBar({collapsed}){
    const {menus,loaded}=useSelector(state=>state.menu);
    const {getLocaleLabel}=useI18n();

    const dispatch=useDispatch();

    useEffect(()=>{
        if(loaded===false){
            dispatch(getUserMenus());
        }
    },[loaded,dispatch]);

    const onClick=({item})=>{
        console.log(item.props.operation);
        if(item.props.operation){
            setOperation(item.props.operation);
        }
    }

    const getMenus=(menuConfs,parentKey)=>{
        const menuItems=[];
        for(let i=0;i<menuConfs.length;i++){
            const item=menuConfs[i];
            const key=parentKey+','+item.id;
            const IconItem=IconList[item.icon?item.icon:"PictureFilled"];
            menuItems.push({
                key:key,
                icon:<IconItem/>,
                children:item.children?getMenus(item.children,key):undefined,
                label:getLocaleLabel(item.name),
                operation:item.operation
            });
        }
        return menuItems;
    }

    const menuItems=getMenus(menus,"");

    return (<div className='menu-wrapper'>
        <div className='logo'>
            <Logo collapsed={collapsed}/>
        </div>
        <Menu
            mode="inline"
            theme="dark"
            inlineCollapsed={collapsed}
            items={menuItems}
            onClick={onClick}
        />
    </div>);
}