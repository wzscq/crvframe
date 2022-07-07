import Text from './Text';
import SingleSelect from './SingleSelect';
//import DatePicker from './DatePicker';
/**
 * 以下为控件类型枚举常量定义
 */
 export const CONTROL_TYPE={
    TEXT:"Text",   //文本录入框
    DATEPICKER:"DatePicker",   //日期选择框
    SINGLESELECT:'SingleSelect'  //单选下拉框
}

/**
 * 以下为控件注册表
 */
export const controlRegister={
    [CONTROL_TYPE.TEXT]:Text,
    [CONTROL_TYPE.SINGLESELECT]:SingleSelect,
}

export const getControl=(field,sendMessageToParent,filterValue,onFilterChange)=>{
    const filterControlType=field.filterControlType?field.filterControlType:CONTROL_TYPE.TEXT;
    const Component=controlRegister[filterControlType];
    if(Component){
        return <Component 
                filterValue={filterValue} 
                onFilterChange={onFilterChange}  
                sendMessageToParent={sendMessageToParent} 
                field={field}/>;
    }
    return (<div>{"unkown control:"+field.filterControlType}</div>);
}