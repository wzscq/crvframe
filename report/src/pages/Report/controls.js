import Chart from './Chart';
import DateLine from './DateLine';
import Table from './Table';

/**
 * 以下为控件类型枚举常量定义
 */
 export const CONTROL_TYPE={
  ECHART:"EChart",   //文本录入框
  DATELINE:'DateLine',  //多行文本编辑框
  TABLE:"Table"   //表格
}

const controls={
  [CONTROL_TYPE.ECHART]:Chart,
  [CONTROL_TYPE.DATELINE]:DateLine,
  [CONTROL_TYPE.TABLE]:Table
}

export const getControl=(control,frameParams,reportID,sendMessageToParent,locale)=>{
  const Component=controls[control.controlType];
  if(Component){
      return <Component locale={locale} key={control.id} frameParams={frameParams} controlConf={control} reportID={reportID} sendMessageToParent={sendMessageToParent} />;
  }
  return (<div>{"unkown control:"+control.controlType}</div>);
}