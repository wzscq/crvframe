import { Button} from 'antd';
import { MenuUnfoldOutlined,MenuFoldOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

import { setInlineCollapsed } from '../../../../redux/menuSlice';

export default function FunctionMenu(){
    const inlineCollapsed=useSelector(state=>state.menu.inlineCollapsed);
    const dispatch=useDispatch();
    const handleClick=()=>{
        dispatch(setInlineCollapsed(!inlineCollapsed));
    }

    return (
        <Button style={{display:'none'}} onClick={handleClick} type="primary" icon={inlineCollapsed?<MenuUnfoldOutlined /> : <MenuFoldOutlined />} size={'small'} />
    );
}