import { Avatar,Tooltip } from 'antd';
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import * as IconList from '@ant-design/icons';

import {resetMenu} from '../../redux/menuSlice';
import {closeAllTab} from '../../redux/tabSlice';

const colorArray = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];

export default function NormalGroupItem({item,index,getLocaleLabel}){
  const dispatch=useDispatch();
  const navigate = useNavigate();
  const IconItem=IconList[item.icon?item.icon:"PictureFilled"];
  let backgroundColor=colorArray[index%colorArray.length];
  if(item.backgroundColor){
    backgroundColor=item.backgroundColor;
  }

  const onClick=()=>{
    dispatch(resetMenu());
    dispatch(closeAllTab());
    navigate("/mainframe/"+item.id)
  }

  return (
    <Tooltip title={getLocaleLabel(item.description)}>
      <div className="menu-group-item-normal" onClick={onClick}>
        <Avatar shape="square" size={64} icon={<IconItem/>} style={{backgroundColor:backgroundColor}} />
        <div className='menu-group-item-name'>{getLocaleLabel(item.name)}</div>
      </div>
    </Tooltip>
  );
}