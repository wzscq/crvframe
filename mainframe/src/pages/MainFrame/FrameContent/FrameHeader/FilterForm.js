import { useSelector } from 'react-redux';

import EditForm from '../../../../component/EditForm';
import { FORM_TYPE } from '../../../../operation/constant';

export default function FilterForm({filterFormConf}){
  const {locale}=useSelector(state=>state.i18n);

  const sendMessageToParent=(message)=>{
    window.parent.postMessage(message,window.location.origin);
  };

  return (
    <EditForm locale={locale}  formConf={filterFormConf} sendMessageToParent={sendMessageToParent} formType={FORM_TYPE.CREATE} />
  );
}