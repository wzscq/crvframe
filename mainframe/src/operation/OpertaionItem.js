import {LoadingOutlined,CheckCircleOutlined} from '@ant-design/icons';
import {
    OP_RESULT
} from "./constant";

export default function OpertaionItem({item,state,getLocaleLabel,getLocaleErrorMessage}){
    let icon=null;
    //getLocaleErrorMessage(item)
    //console.log("OpertaionItem",item);
    
    if(state===1){
        icon=<LoadingOutlined />
    }
    if(state===2){
        icon=<CheckCircleOutlined twoToneColor="#52c41a"/>
    }
    return (
        <div>
            {icon}
            <span>{item?.description?getLocaleLabel(item.description):""}</span>
            {item.result===OP_RESULT.ERROR?
                (<>
                    <br/>
                    <span style={{color:"red"}}>{getLocaleLabel({key:'dialog.operation.hasErrors',default:'出错啦，'})}{getLocaleErrorMessage(item)}{item.resultParams!==undefined&&item.resultParams!==null?JSON.stringify(item.resultParams):""}</span>
                </>):null}
        </div>
    );
}