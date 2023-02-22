import { Button } from 'antd';
import { useDispatch } from 'react-redux';

import EditForm from '../../../components/EditForm';
import { refreshData } from '../../../redux/reportSlice';
import { FORM_TYPE } from '../../../utils/constant';

import './index.css';

export default function Header({filterFormConf,sendMessageToParent}){
  const dispatch=useDispatch();

  const onRefresh=()=>{
    dispatch(refreshData());
  }

  return (
    <div className="header">
      <div className='filter-form'>
        <EditForm formConf={filterFormConf} sendMessageToParent={sendMessageToParent} formType={FORM_TYPE.CREATE} />
      </div>
      <div className='refresh-button'>
        <Button size='small' type='primary' onClick={onRefresh}>刷新</Button>
      </div>
    </div>
  );
}