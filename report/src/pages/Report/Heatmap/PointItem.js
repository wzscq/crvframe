
import { Tooltip } from 'antd';

export default function PointItem({item}){
    let open=undefined;
    if(item.open==1){
        open=true;
    }

    if(item.open==0){
        open=false;
    }

    return (
        <Tooltip title={item.tip} open={open}>
            <div className='point-item' style={{left:item.x+'px',top:item.y+'px'}}/>
        </Tooltip>
    )
}