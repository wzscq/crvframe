import React from 'react';
import { Card,Button } from 'antd';
import * as IconList from '@ant-design/icons';

import I18nLabel from './I18nLabel';
import {FRAME_MESSAGE_TYPE} from '../../utils/constant';

export default function FunctionItem({item,sendMessageToParent}){
    const doOperation=()=>{
        const message={
            type:FRAME_MESSAGE_TYPE.DO_OPERATION,
            data:{
                operationItem:item.operation
            }
        };
        sendMessageToParent(message);
    }
    
    const IconItem=IconList[item.icon?item.icon:"PictureFilled"];

    const titleComponent=(
        <>
            <IconItem/>
            <I18nLabel label={item.name}/>
        </>
        );

    const openLabel=item.openLabel?item.openLabel:{key:'page.function.defaultOpenLabel',default:'打开'};
    const extraComponent=(
        <Button type="link" onClick={doOperation}><I18nLabel label={openLabel}/></Button>
    )

    return (
        <Card size="small" title={titleComponent} extra={extraComponent} style={{minWidth:190}}>
            <I18nLabel label={item.description}/>
        </Card>
    );
}