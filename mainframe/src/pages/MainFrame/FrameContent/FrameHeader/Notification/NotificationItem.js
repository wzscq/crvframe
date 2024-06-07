import { Button, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import * as IconList from '@ant-design/icons';
import {setOperation} from '../../../../../operation';

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

    return (
    <div style={{width:"100%"}}>
        <div style={{width:"100%",display:"flex"}}>
            <div style={{flex:"1"}}>
                {item.item.buttons?.map((button,index)=>{
                    const IconItem=IconList[button.icon?button.icon:"UnorderedListOutlined"];
                    return (
                        <Tooltip zIndex={10000} title={getLocaleLabel(button.tip??'')}>
                            <Button key={index} onClick={()=>{setOperation(button.operation)}} type="link" icon={<IconItem/>} />
                        </Tooltip>)
                })}
            </div>
            <div style={{flex:"0 0 21px"}}>
                <Tooltip zIndex={10000} title={getLocaleLabel({key:"page.main.removeNotificationItem",default:"删除"})}>
                    <Button onClick={()=>removeNotificationItem(item)}  type="link" icon={<DeleteOutlined/>} />
                </Tooltip>
            </div>
        </div>
        <div style={{width:"100%"}} dangerouslySetInnerHTML={{ __html:getContentFunc(item.item.content)(item.data)}}/>
    </div>)
}