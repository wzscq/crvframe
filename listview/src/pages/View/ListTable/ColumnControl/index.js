import { Button,Popover } from 'antd';
import {
    MoreOutlined
  } from '@ant-design/icons';

import {getControl} from './controls';
import CellPopMenu from './CellPopMenu';

export default function ColumnControl({sendMessageToParent,text,field, record, index}){
    const colCtl=getControl(text,field, record, index);
   
    if(field.cellPopMenu){
        const content=<CellPopMenu sendMessageToParent={sendMessageToParent} cellPopMenu={field.cellPopMenu} record={record} index={index}/>;
        return (
            <>
                <div style={{float:'left',width:'calc(100% - 20px)'}}>{colCtl}</div>
                <Popover placement="bottomRight" content={content} trigger="click">
                    <Button type="link" size={'small'}><MoreOutlined /></Button>
                </Popover>
            </>
        );
    }

    return colCtl;
}