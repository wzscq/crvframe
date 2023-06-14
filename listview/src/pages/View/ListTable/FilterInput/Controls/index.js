import Text from './Text';
import SingleSelect from './SingleSelect';
import MultiSelect from './MultiSelect';
import DatePicker from './DatePicker';
/**
 * 以下为控件类型枚举常量定义
 */
export const CONTROL_TYPE={
    Text:"Text",   //文本录入框
    DatePicker:"DatePicker",   //日期选择框
    SingleSelect:'SingleSelect',  //单选下拉框
    MultiSelect:'MultiSelect',  //多选下拉框
}

/**
 * 以下为控件注册表
 */
export const controlRegister={
    [CONTROL_TYPE.Text]:Text,
    [CONTROL_TYPE.SingleSelect]:SingleSelect,
    [CONTROL_TYPE.MultiSelect]:MultiSelect,
    [CONTROL_TYPE.DatePicker]:DatePicker,
}

export const getControl=(field,sendMessageToParent,filterValue,onFilterChange)=>{
    const filterControl=field.filterControl?field.filterControl:(field.filterControlType?field.filterControlType:CONTROL_TYPE.Text);
    const Component=controlRegister[filterControl];
    if(Component){
        return <Component 
                filterValue={filterValue} 
                onFilterChange={onFilterChange}  
                sendMessageToParent={sendMessageToParent} 
                field={field}/>;
    }
    return (<div>{"unkown control:"+filterControl}</div>);
}