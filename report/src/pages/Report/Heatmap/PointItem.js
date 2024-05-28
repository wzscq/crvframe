
import { Tooltip } from 'antd';

export default function PointItem({item}){
    return (
        <Tooltip title={item.tip}>
            <div className='point-item' style={{left:item.x+'px',top:item.y+'px'}}/>
        </Tooltip>
    )
}