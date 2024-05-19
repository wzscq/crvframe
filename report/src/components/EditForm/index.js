import { useMemo,useEffect } from "react";
import { useSelector,useDispatch } from "react-redux";
import {ConfigProvider} from 'antd';
import zh_CN from 'antd/lib/locale/zh_CN';
import en_US from 'antd/lib/locale/en_US';

import { FORM_TYPE } from "../../utils/constant";
import FormControl from './FormControl';
import './index.css';

const locales={
  zh_CN:zh_CN,
  en_US:en_US
}

export default function EditForm({locale,formConf,sendMessageToParent,fields,formType}){
  const rowKey = useSelector(state=>{
    return Object.keys(state.data.updated)[0]
  });

  const dataPath=useMemo(()=>{
      return [rowKey];
  },[rowKey]);

  const {controls,colCount,rowHeight}=useMemo(()=>{
    if(formConf){
        const {colCount,rowHeight}=formConf;
        const controls=formConf.controls.map((item,index)=>{
            let field=fields?.find(element=>element.field===item.field);
            //这里增加处理逻辑，允许表单配置中配置临时字段，临时字段不对应实际数据表的字段，
            //仅用于调用特殊接口时使用，比如导入接口，允许选择一个文件，这里通过临时字段来装载选择的文件信息
            if(!field&&item.field){
                field={field:item.field,fieldType:item.fieldType,relatedModelID:item.relatedModelID}                    
            }
            //如果是编辑页面，则将ID字段置为不可修改,详情页面则所有字段都不允许修改
            if((item.field==='id'&&formType===FORM_TYPE.EDIT)||
                formType===FORM_TYPE.DETAIL){
                return (<FormControl labelPos={formConf.labelPos} dataPath={dataPath} sendMessageToParent={sendMessageToParent}  item={{...item,disabled:true}} field={field} key={index} />);
            } else {
                return (<FormControl labelPos={formConf.labelPos} dataPath={dataPath} sendMessageToParent={sendMessageToParent} item={item} field={field} key={index} />);
            }
        });
        return {controls,colCount,rowHeight}
    } else {
        return {controls:[],colCount:1,rowHeight:30}
    }
  },[formConf,fields,formType,dataPath,sendMessageToParent]);

  return (
    <ConfigProvider locale={locales[locale]}>
      <div className='edit-form' style={{gridTemplateColumns: "repeat("+colCount+", 1fr)",gridAutoRows:"minmax("+rowHeight+"px, auto)"}}>
          {controls}
      </div>
    </ConfigProvider>
  );
}