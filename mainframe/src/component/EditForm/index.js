import { useMemo,useEffect } from "react";
import { useSelector,useDispatch } from "react-redux";
import {ConfigProvider} from 'antd';
import zh_CN from 'antd/locale/zh_CN';
import en_US from 'antd/locale/en_US';

import { 
  FORM_TYPE,
  FRAME_MESSAGE_TYPE 
} from "../../operation/constant";
import FormControl from './FormControl';
import {setData} from '../../redux/dataSlice';

import './index.css';

const locales={
  zh_CN:zh_CN,
  en_US:en_US
}

export default function EditForm({locale,formConf,sendMessageToParent,fields,formType}){
  const disspatch=useDispatch();
  const {origin,item:frameItem}=useSelector(state=>state.frame);
  const {loaded} = useSelector(state=>state.data);
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
                //field={...item}                    
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

  useEffect(()=>{
    if(loaded===false){
      const queryResponse=(event)=>{
          const {type,dataKey,data}=event.data;
          if(type===FRAME_MESSAGE_TYPE.QUERY_RESPONSE&&
              dataKey==="__editform_initData"){
              disspatch(setData({data,controls:formConf.controls}));
          }
      }
      window.addEventListener("message",queryResponse);
      return ()=>{
          window.removeEventListener("message",queryResponse);
      }
    }
  },[loaded,formConf,disspatch]);

  //加载初始化数据
  useEffect(()=>{
    if(formConf?.initData){
      const {initData}=formConf;    
      const frameParams={
        frameType:frameItem.frameType,
        frameID:frameItem.params.key,
        dataKey:"__editform_initData",
        origin:origin
      };
      const message={
          type:FRAME_MESSAGE_TYPE.QUERY_REQUEST,
          data:{
              frameParams:frameParams,
              queryParams:initData
          }
      }
      sendMessageToParent(message);
    }
  },[formConf]);

  return (
    <ConfigProvider locale={locales[locale]}>
      <div className='edit-form' style={{gridTemplateColumns: "repeat("+colCount+", auto)",gridAutoRows:"minmax("+rowHeight+"px, auto)"}}>
          {controls}
      </div>
    </ConfigProvider>
  );
}