import { Button } from 'antd';
import { useDispatch } from 'react-redux';

import EditForm from '../../../components/EditForm';
import { refreshData } from '../../../redux/reportSlice';
import { FORM_TYPE } from '../../../utils/constant';

import './index.css';

export default function Header({getLocaleLabel,filterFormConf,sendMessageToParent,locale}){
  const dispatch=useDispatch();

  const onRefresh=()=>{
    dispatch(refreshData());
  }

  return (
    <div className="header">
      <div className='filter-form'>
        <EditForm locale={locale}  formConf={filterFormConf} sendMessageToParent={sendMessageToParent} formType={FORM_TYPE.CREATE} />
      </div>
      <div className='refresh-button'>
        <Button size='small' type='primary' onClick={onRefresh}>{getLocaleLabel({key:'page.report.refresh',default:'Refresh'})}</Button>
      </div>
    </div>
  );
}