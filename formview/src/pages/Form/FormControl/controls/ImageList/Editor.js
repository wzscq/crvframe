import { Modal } from "antd"
import ImageEditor from './ImageEditor'
import getToolbar from "./ImageEditorToolbar"
import { useCallback, useState } from "react"

var g_getDataUrl=null

export default function Editor({open,onEditorOk,onEditorCancel,src,title,width,height}){
    //const [getDataUrl,setGetDataUrl]=useState(null)    

    const onOk=()=>{
        onEditorOk(g_getDataUrl);
    }

    const getToolbarWrapper=(params)=>{
        const {getDataUrl}=params
        g_getDataUrl=getDataUrl
        //setGetDataUrl(getDataUrl)
        return getToolbar(params)
    }

    return (
        <Modal
            width={width}
            open={open}
            title={title}
            onOk={onOk}
            onCancel={onEditorCancel}
            centered={true}
        >
            <div style={{height:height,width:'100%'}}>
                <ImageEditor imageUrl={ src } toolbar={getToolbarWrapper}/>
            </div>
        </Modal>
    )
}