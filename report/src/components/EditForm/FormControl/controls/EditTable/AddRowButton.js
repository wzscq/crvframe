import { Button, Tooltip } from 'antd';
import {PlusOutlined} from '@ant-design/icons';

import I18nLabel from '../../../../I18nLabel';

export default function AddRowButton({label,disabled,colNo,onAddNewRow}){
    const wrapperStyle={
        gridColumnStart:colNo+1,
        gridColumnEnd:colNo+2,
        gridRowStart:1,
        gridRowEnd:2,
        backgroundColor:'#FFFFFF',
        borderBottom:'1px solid #d9d9d9',
        borderLeft:'1px solid #d9d9d9',
        textAlignment:'center',
        padding:2}

    return (
        <div style={wrapperStyle}>
            <Tooltip title={<I18nLabel label={label?label:'add new row'}/>}>
                <Button disabled={disabled} size='small' onClick={onAddNewRow} icon={<PlusOutlined />}/>
            </Tooltip>
        </div>
    );
}