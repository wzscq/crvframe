
import { Modal} from 'antd';
import { useSelector } from "react-redux";

import {dialogRepository} from "./constant.js";
import FrameDialog from './FrameDialog';
import useI18n from '../hook/useI18n';

export {DIALOG_TYPE} from "./constant.js";

export default function Dialog(){
    const {getLocaleLabel}=useI18n();
    const item=useSelector(state=>state.dialog.current);
    if (item === null) {
        return null;
    }
    //首先检查URL是否是内部对话框的URL，如果是则打开内部对话框，
    //否则认为URL指向一个外部地址，通过IFRAME打开对应的URL
    const dialog=dialogRepository[item.params.url];
    if(dialog){
        return (
            <Modal 
                title={getLocaleLabel(dialog.title)}
                closable={false}
                zIndex={100} 
                visible={true} 
                centered={true}
                footer={null}>
                {dialog.component}
            </Modal>
        );
    } else {
        return (<FrameDialog item={item} />);
    }
}