import { Button, Tooltip,Progress } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import * as IconList from '@ant-design/icons';
import {setOperation} from '../../../../../operation';
import { useCallback } from "react";

export default function NotificationItem({getLocaleLabel,item,removeNotificationItem}){
    const getContentFunc=(content)=>{
        const funStr='"use strict";'+
                    'return (function(record){ '+
                        'try {'+
                        content+
                        '} catch(e) {'+
                        '   console.error(e);'+
                        '   return undefined;'+
                        '}'+
                    '})';
        return Function(funStr)();
    };

    const getProgressPercent=(percent)=>{
        const funStr='"use strict";'+
                    'return (function(record){ '+
                        'try {'+
                        percent+
                        '} catch(e) {'+
                        '   console.error(e);'+
                        '   return undefined;'+
                        '}'+
                    '})';
        return Function(funStr)();
    }

    const getProgressStatus=(status)=>{
        const funStr='"use strict";'+
        'return (function(record){ '+
            'try {'+
            status+
            '} catch(e) {'+
            '   console.error(e);'+
            '   return undefined;'+
            '}'+
        '})';
        return Function(funStr)();
    }

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

    const doOperation=useCallback((operation)=>{
        let row={...item.data};
        if(operation?.input?.list?.length>0){
            const initRowData=operation.input.list[0];
            row={...row,...initRowData};
        }
        setOperation({...operation,input:{...operation.input,list:[row]}});
    },[item]);

    let progress=null;
    if(item?.item?.progress?.show===true){
        const percent=getProgressPercent(item.item.progress.percent)(item.data);
        const status=getProgressStatus(item.item.progress.status)(item.data);
        progress=<Progress  percent={percent} status={status}/>;
    }

    let removeButton=null;
    if(item?.item?.updateStrategy){
        const {condition,operation}=item.item.updateStrategy;
        if(getUpdateConditionFunc(condition)(item.data)===true){
            removeButton=(
                <Tooltip zIndex={10000} title={getLocaleLabel({key:"page.main.removeNotificationItem",default:"删除"})}>
                    <Button onClick={()=>removeNotificationItem(item)}  type="link" icon={<DeleteOutlined/>} />
                </Tooltip>
            )
        }
    }

    return (
    <div style={{width:"calc(100% - 5px)"}}>
        <div style={{width:"100%",display:"flex"}}>
            <div style={{flex:"1"}}>
                {item.item.buttons?.map((button,index)=>{
                    const IconItem=IconList[button.icon?button.icon:"UnorderedListOutlined"];
                    return (
                        <Tooltip zIndex={10000} title={getLocaleLabel(button.tip??'')}>
                            <Button key={index} onClick={()=>{doOperation(button.operation)}} type="link" icon={<IconItem/>} />
                        </Tooltip>)
                })}
            </div>
            <div style={{flex:"0 0 21px"}}>
                {removeButton}
            </div>
        </div>
        <div style={{width:"100%"}} dangerouslySetInnerHTML={{ __html:getContentFunc(item.item.content)(item.data)}}/>
        {progress}
    </div>)
}