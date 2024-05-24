import { Space } from 'antd';
import { useDispatch} from 'react-redux';

import EditForm from '../../../components/EditForm';
import { refreshData } from '../../../redux/reportSlice';
import { FORM_TYPE } from '../../../utils/constant';
import OperationButton from './OperationButton';

import './index.css';

export default function Header({getLocaleLabel,filterFormConf,headerButtons,sendMessageToParent,locale}){
  const dispatch=useDispatch();

  const onRefresh=()=>{
    dispatch(refreshData());
  }

  return (
    <div className="header">
      <div className='filter-form'>
        <EditForm locale={locale}  formConf={filterFormConf} sendMessageToParent={sendMessageToParent} formType={FORM_TYPE.CREATE} />
      </div>
      {headerButtons?.length>0?(<div className='operation-bar'>
        <Space>
          {
            headerButtons.map((operation,index)=><OperationButton key={index} getLocaleLabel={getLocaleLabel} operation={operation} sendMessageToParent={sendMessageToParent}/>)
          }
        </Space>
      </div>):null}
    </div>
  );
}