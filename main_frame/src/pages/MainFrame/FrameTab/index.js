import { Tabs } from 'antd';
import { useEffect, useMemo } from 'react';

import { useSelector,useDispatch } from 'react-redux';
import {setActiveTab,closeTab} from '../../../redux/tabSlice';
import {setActive} from '../../../redux/logSlice';
import LogTab from '../../../tabs/LogTab';
import ChildFrame from './ChildFrame';
import useI18n from '../../../hook/useI18n';

import "./index.css";

export default function FrameTab(){
    const dispatch=useDispatch();
    const tab=useSelector(state=>state.tab);
    const {getLocaleLabel,locale,resources}=useI18n();
    const { TabPane } = Tabs;

    const onChangeTab=(key)=>{
        dispatch(setActiveTab(key));  
    }

    const onEditTab=(key,action)=>{
        tab.items.forEach((item)=>{
            if(item.params.key===key){
                dispatch(closeTab(item));
            }
        });
    }

    const logTab=useMemo(()=>{
        return tab.items.find(item=>item.params.key==="/log");
    },[tab]);

    useEffect(()=>{
        //看一下logtab是否打开，只有在打开的情况下才记录日志，否则不记录日志
        if(logTab){
            dispatch(setActive(true));
        } else {
            dispatch(setActive(false));
        }
    },[logTab,dispatch]);

    const getTitleLable=(title)=>{
        if(typeof title === 'string'){
            return title;
        }
        return getLocaleLabel(title);
    }
    
    //这里注意初始时由于locale是undefined，在刷新页面时会导致tab页多次刷新会造成多次触发子页面INIT的情况，这里暂时用locale是否未空做个临时处理
    return (
        <div className="frame-tab-main">
            <Tabs onChange={onChangeTab} onEdit={onEditTab} type="editable-card" hideAdd={true} activeKey={tab.current}>
            {
                tab.items.map((item)=>{
                    const {key,title}=item.params;
                    
                    const titleLabel=getTitleLable(title);
                    
                    if(key==="/log"){
                        return (
                            <TabPane tab={titleLabel} key={key} closable={true}>
                                <LogTab/>
                            </TabPane>);
                    }

                    return (
                        <TabPane tab={titleLabel} key={key} closable={true}>
                            <ChildFrame locale={locale}  resources={resources} isActive={key===tab.current} item={item}/>
                        </TabPane>
                    );
                })
            }
            </Tabs>
        </div>
    );
}