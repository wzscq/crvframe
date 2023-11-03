import Text from './Text';
import SingleSelect from './SingleSelect';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';
import Number from './Number';

/**
 * 以下为控件类型枚举常量定义
 */
 export const CONTROL_TYPE={
    TEXT:"Text",   //文本录入框
    DATEPICKER:"DatePicker",   //日期选择框
    TIMEPICKER:"TimePicker",  //时间选择
    SINGLESELECT:'SingleSelect',  //单选下拉框
    Number:'Number' //数值录入
}

/**
 * 以下为控件注册表
 */
export const controlRegister={
    [CONTROL_TYPE.TEXT]:Text,
    [CONTROL_TYPE.SINGLESELECT]:SingleSelect,
    [CONTROL_TYPE.DATEPICKER]:DatePicker,
    [CONTROL_TYPE.TIMEPICKER]:TimePicker,
    [CONTROL_TYPE.Number]:Number
}

export const getControl=(control,field,sendMessageToParent,dataPath,labelPos)=>{
    const Component=controlRegister[control.controlType];
    if(Component){
        return <Component 
            dataPath={dataPath} 
            sendMessageToParent={sendMessageToParent} 
            control={control} 
            labelPos={labelPos}
            field={field}/>;
    }
    return (<div>{"unkown control:"+control.controlType}</div>);
}