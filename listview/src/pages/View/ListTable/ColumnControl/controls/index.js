import DefaultColumnControl from "./DefaultColumnControl";
import Progress from "./Progress";
import FileControl from "./FileControl";

/**
 * 以下为控件类型枚举常量定义
 */
 export const CONTROL_TYPE={
  Progress:'Progress',  //单选下拉框
  File:'File',  //文件显示
  DefaultColumnControl:'DefaultColumnControl',  //多选下拉框
}

/**
* 以下为控件注册表
*/
export const controlRegister={
  [CONTROL_TYPE.Progress]:Progress,
  [CONTROL_TYPE.DefaultColumnControl]:DefaultColumnControl,
  [CONTROL_TYPE.File]:FileControl
}

export function getControl(text,field, record, index){
  const controlType=field.columnControl?field.columnControl:CONTROL_TYPE.DefaultColumnControl;
  const Component=controlRegister[controlType];
  if(Component){
    return <Component text={text} field={field} record={record} index={index}/>;
  }
  return (<div>{"unkown control:"+controlType}</div>);
}