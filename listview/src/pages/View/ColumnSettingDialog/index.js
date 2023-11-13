import { Modal,ConfigProvider } from 'antd';
import { useSelector,useDispatch } from 'react-redux';
import {useMemo,useState} from 'react';

import zh_CN from 'antd/lib/locale/zh_CN';
import en_US from 'antd/lib/locale/en_US';

import useI18n from '../../../hooks/useI18n';
import { setShowColumnSettingDialog,setViewFields } from '../../../redux/definitionSlice';
import TableTransfer from './TableTransfer';

import './index.css';

const locales={
  zh_CN:zh_CN,
  en_US:en_US
}

export default function ColumnSettingDialog(){
  const dispatch=useDispatch();
  const {getLocaleLabel,locale}=useI18n();
  const {showColumnSettingDialog,fields}=useSelector(state=>state.definition);
  const {currentView,viewconf}=useSelector(state=>{
    const currentView=state.data.currentView;
    const viewconf=state.definition.views.find(item=>item.viewID===currentView);
    return {currentView,viewconf};
  });
  const [targetKeys, setTargetKeys] = useState(viewconf?.fields? viewconf.fields.filter(item=>item.visible!==false).map(item=>item.field):[]);
  const [dataSource,setDataSource]=useState(viewconf?.fields?viewconf.fields.map((fieldItem,index) => {
    const fieldConf=fields.find(item=>item.field===fieldItem.field);
    if(fieldConf){
      const item={...fieldConf,...fieldItem};
      return {key:item.field,title:getLocaleLabel(item.name)}; 
    } else {
      return null;
    }
  }).filter(item=>item!==null):[]);

  const handleOk = () => {
    const visibleColumn=targetKeys.map(key=>{
      const item= viewconf?.fields?.find(field=>field.field===key);
      return {...item,visible:true};
    });
    const hiddenColumn=viewconf?.fields?.filter(field=>{
      const findKey=targetKeys.find(key=>key===field.field);
      if(findKey){
        return false;
      }
      return true;
    }).map(item=>({...item,visible:false}));

    dispatch(setViewFields({viewID:currentView,fields:[...visibleColumn,...hiddenColumn]}));
    dispatch(setShowColumnSettingDialog(false));
  }

  const handleCancel = () => {
    dispatch(setShowColumnSettingDialog(false));
  }

  const onChange = (nextTargetKeys, direction, moveKeys) => {
    setTargetKeys(nextTargetKeys);
  };

  return (
    <ConfigProvider locale={locales[locale]}>
        <Modal 
          className='column-setting-dialog'
          title={getLocaleLabel({key:'page.crvlistview.column',default:'列设置'})} 
          open={showColumnSettingDialog} 
          onOk={handleOk} 
          centered
          width={800}
          height={400}
          onCancel={handleCancel}
          okText={getLocaleLabel({key:'page.crvlistview.ok',default:'确认'})}
          cancelText={getLocaleLabel({key:'page.crvlistview.cancel',default:'取消'})}
          >
            <TableTransfer
              dataSource={dataSource}
              targetKeys={targetKeys}
              onChange={onChange}
              setDataSource={setDataSource}
              setTargetKeys={setTargetKeys}
              titles={[getLocaleLabel({key:'page.crvlistview.hidedColumn',default:'隐藏列'}), getLocaleLabel({key:'page.crvlistview.visibleColumn',default:'显示列'})]}
            />
        </Modal>
    </ConfigProvider>
  )
}