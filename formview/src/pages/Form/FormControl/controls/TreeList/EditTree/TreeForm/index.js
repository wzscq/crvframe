import { useSelector } from 'react-redux';

import EditForm from '../../../../../../../component/EditForm';
import { FORM_TYPE } from '../../../../../../../utils/constant';

export default function TreeForm({formConf,sendMessageToParent}){
  const {locale}=useSelector(state=>state.i18n);

  return (
    <EditForm locale={locale}  formConf={formConf} sendMessageToParent={sendMessageToParent} formType={FORM_TYPE.CREATE} />
  );
}