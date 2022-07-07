import { Button, Tooltip } from 'antd';
import {MinusOutlined} from '@ant-design/icons';
import I18nLabel from '../../../../../component/I18nLabel';

export default function DeleteRowButton({label,disabled,rowKey,colNo,onDeleteRow}){
    const wrapperStyle={
        gridColumnStart:colNo+1,
        gridColumnEnd:colNo+2,
        gridRowStart:1,
        gridRowEnd:2,
        backgroundColor:'#FFFFFF',
        borderBottom:'1px solid #d9d9d9',
        borderLeft:'1px solid #d9d9d9',
        textAlignment:'center',
        padding:2};

    return (
        <div style={wrapperStyle}>
            <Tooltip title={<I18nLabel label={label?label:'delete'}/>}>
                <Button size='small' disabled={disabled} onClick={()=>onDeleteRow(rowKey)} icon={<MinusOutlined />}/>
            </Tooltip>
        </div>
    );
}