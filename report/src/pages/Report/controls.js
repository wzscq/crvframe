import Chart from './Chart';
import DateLine from './DateLine';

/**
 * 以下为控件类型枚举常量定义
 */
 export const CONTROL_TYPE={
  EChart:"EChart",   //文本录入框
  DATELINE:'DateLine'  //多行文本编辑框
}

const controls={
  [CONTROL_TYPE.EChart]:Chart,
  [CONTROL_TYPE.DATELINE]:DateLine
}

export const getControl=(control,frameParams,reportID,sendMessageToParent)=>{
  const Component=controls[control.controlType];
  if(Component){
      return <Component key={control.id} frameParams={frameParams} controlConf={control} reportID={reportID} sendMessageToParent={sendMessageToParent} />;
  }
  return (<div>{"unkown control:"+control.controlType}</div>);
}