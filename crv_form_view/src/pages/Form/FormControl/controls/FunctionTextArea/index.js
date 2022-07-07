import {Input,Space} from 'antd';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import I18nLabel from '../../../../../component/I18nLabel';

const {TextArea} = Input;

export default function FunctionTextArea({dataPath,control}){
    
    const getFieldData=(field,data)=>{
        let updatedNode=data.updated;
        
        for(let i=0;i<dataPath.length;++i){
            updatedNode=updatedNode[dataPath[i]];
            if(!updatedNode){
                return undefined;
            }
        }
        
        return updatedNode[field];
    }
    
    const relatedData=useSelector(state=>{
        const data={};
        if( control.fields && Array.isArray(control.fields)){
            control.fields.forEach(field => {
                data[field]=getFieldData(field,state.data);
            });
        }
        return data;
    });

    const func=useMemo(()=>{
        const funStr='"use strict";'+
                     'return (function(data){ '+
                        'try {'+
                           control.function+
                        '} catch(e) {'+
                        '   console.error(e);'+
                        '   return undefined;'+
                        '}'+
                     '})';
        return Function(funStr)();
    },[control]);

    const textControl=(
        <TextArea  
            value={func(relatedData)} 
            rows={control.textRowCount}
            disabled={true} 
        />
    );

    return (
        <div>
            <Space size={2} direction="vertical" style={{width:'100%'}}>
                <div style={{width:'100%',textAlign:'left'}}>
                    <I18nLabel label={control.label}/>
                </div>
                {textControl}
            </Space>
        </div>
    );
}