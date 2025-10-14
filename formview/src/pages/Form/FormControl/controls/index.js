import Text from './Text';
import Password from './Password';
import Transfer from './Transfer';
import FileControl from './FileControl';
import SingleSelect from './SingleSelect';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';
import TextArea from './TextArea';
import EditTable from './EditTable';
import FunctionTextArea from './FunctionTextArea';
import ImageList from './ImageList';
import Number from './Number';
import RichText from './RichText';
import ValueLabel from './ValueLabel';
import ColorPicker from './ColorPicker';
import UploadControl from './UploadControl';
import FilePreview from './FilePreview';
import RSAEncryptText from './RSAEncryptText';
import Html from './Html';
import MultiSelect from './MultiSelect';
import DynamicInput from './DynamicInput';

/**
 * 以下为控件类型枚举常量定义
 */
 export const CONTROL_TYPE={
    TEXT:"Text",   //文本录入框
    TEXTAREA:'TextArea',  //多行文本编辑框
    DATEPICKER:"DatePicker",   //日期选择框
    TIMEPICKER:"TimePicker",  //时间选择
    PASSWORD:"Password",    //密码输入控件
    TRANSFER:"Transfer",    //穿梭框控件
    FILE:"File", //文件选择，转换为base64编码
    UPLOAD:"Upload", //文件上传,选择文件后自动上传
    SINGLESELECT:'SingleSelect',  //单选下拉框
    EDITTABLE:'EditTable',  //表格编辑控件
    FUNCTIONTEXTAREA:'FunctionTextArea', //函数计算文本控件
    IMAGELIST:'ImageList', //图片文件列表
    Number:'Number', //数值录入
    RichText:"RichText", //富文本
    ValueLabel:"ValueLabel",  //用于显示不能修改的值
    ColorPicker:"ColorPicker",  //颜色选择器
    FilePreview:"FilePreview",  //文件预览
    RSAEncryptText:"RSAEncryptText", //RSA加密文本
    Html:"Html",   //Html内容文本
    MultiSelect:"MultiSelect",  //多选下拉框
    DynamicInput:"DynamicInput"  //动态输入控件
}

/**
 * 以下为控件注册表
 */
export const controlRegister={
    [CONTROL_TYPE.TEXT]:Text,
    [CONTROL_TYPE.PASSWORD]:Password,
    [CONTROL_TYPE.TRANSFER]:Transfer,
    [CONTROL_TYPE.FILE]:FileControl,
    [CONTROL_TYPE.UPLOAD]:UploadControl,
    [CONTROL_TYPE.SINGLESELECT]:SingleSelect,
    [CONTROL_TYPE.DATEPICKER]:DatePicker,
    [CONTROL_TYPE.TIMEPICKER]:TimePicker,
    [CONTROL_TYPE.TEXTAREA]:TextArea,
    [CONTROL_TYPE.EDITTABLE]:EditTable,
    [CONTROL_TYPE.FUNCTIONTEXTAREA]:FunctionTextArea,
    [CONTROL_TYPE.IMAGELIST]:ImageList,
    [CONTROL_TYPE.Number]:Number,
    [CONTROL_TYPE.RichText]:RichText,
    [CONTROL_TYPE.ValueLabel]:ValueLabel,
    [CONTROL_TYPE.ColorPicker]:ColorPicker,
    [CONTROL_TYPE.FilePreview]:FilePreview,
    [CONTROL_TYPE.RSAEncryptText]:RSAEncryptText,
    [CONTROL_TYPE.Html]:Html,
    [CONTROL_TYPE.MultiSelect]:MultiSelect,
    [CONTROL_TYPE.DynamicInput]:DynamicInput
}

export const getControl=(control,field,sendMessageToParent,dataPath)=>{
    const Component=controlRegister[control.controlType];
    if(Component){
        return <Component 
            dataPath={dataPath} 
            sendMessageToParent={sendMessageToParent} 
            control={control} 
            field={field}/>;
    }
    return (<div>{"unkown control:"+control.controlType}</div>);
}