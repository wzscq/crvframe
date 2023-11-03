import { Tabs } from 'antd';
import { useEffect, useMemo } from 'react';

import { useSelector,useDispatch } from 'react-redux';
import {setActiveTab,closeTab} from '../../../../redux/tabSlice';
import {setActive} from '../../../../redux/logSlice';
import LogTab from '../../../../tabs/LogTab';
import ChildFrame from './ChildFrame';
import useI18n from '../../../../hook/useI18n';

import "./index.css";

export default function FrameTab({inResize}){
    const dispatch=useDispatch();
    const {current,items}=useSelector(state=>state.tab);
    const filterData=useSelector(state=>state.data.updated[Object.keys(state.data.updated)[0]]);
    const {getLocaleLabel,locale,resources}=useI18n();
    const { TabPane } = Tabs;

    const onChangeTab=(key)=>{
        dispatch(setActiveTab(key));  
    }

    const onEditTab=(key,action)=>{
        items.forEach((item)=>{
            if(item.params.key===key){
                dispatch(closeTab(item));
            }
        });
    }

    const logTab=useMemo(()=>{
        return items.find(item=>item.params.key==="/log");
    },[items]);

    useEffect(()=>{
        //看一下logtab是否打开，只有在打开的情况下才记录日志，否则不记录日志
        if(logTab){
            dispatch(setActive(true));
        } else {
            dispatch(setActive(false));
        }
    },[logTab,dispatch]);

    const tabItems=useMemo(()=>{
        const getTitleLable=(title)=>{
            if(typeof title === 'string'){
                return title;
            }
            return getLocaleLabel(title);
        }

        return items.map((item)=>{
            const {key,title,closable}=item.params;
            
            const titleLabel=getTitleLable(title);
            
            if(key==="/log"){
                return (
                    <TabPane tab={titleLabel} key={key} closable={true}>
                        <LogTab/>
                    </TabPane>);
            }

            return (
                <TabPane tab={titleLabel} key={key} closable={closable===false?false:true}>
                    <ChildFrame inResize={inResize} filterData={filterData} locale={locale}  resources={resources} item={item}/>
                </TabPane>
            );
        });
    },[items,getLocaleLabel,locale,resources,filterData,inResize]);
    
    //这里注意初始时由于locale是undefined，在刷新页面时会导致tab页多次刷新会造成多次触发子页面INIT的情况，这里暂时用locale是否未空做个临时处理
    return (
        <div className="frame-tab-main">
            <Tabs onChange={onChangeTab} onEdit={onEditTab} type="editable-card" hideAdd={true} activeKey={current}>
                {tabItems}
            </Tabs>
        </div>
    );
}