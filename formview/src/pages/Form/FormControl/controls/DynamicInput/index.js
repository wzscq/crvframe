import {useMemo} from 'react';
import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { getControl } from '../index';

const getCascadeItemValue=(data,dataPath,field,cascade)=>{
    if(cascade&&cascade.parentField){
        let pathDeep=dataPath.length;
        if(cascade.parentPath){
            const pathArr=cascade.parentPath.split('/');
            for(let i=0;i<pathArr.length;++i){
                if(pathArr[i]==='..'){
                    /**
                     *dataPaht的形式类似[rowKey,fieldid,list,rowkey,fieldid,list,rowKey,fieldid,list, ...] 
                    *当前字段节点的path一定是一个rowKey节点，往上一层需要自动跳转到上一个rowKey节点
                    *两个rowKey间的间隔是3，因此遇到一个..，则路径深度减3
                    */
                    pathDeep-=3;
                } else {
                    break;
                }
            }
        }
        
        let updatedNode=data.updated;
        for(let i=0;i<pathDeep;++i){
            updatedNode=updatedNode[dataPath[i]];
            if(!updatedNode){
                return {};
            }
        }
        
        if(updatedNode[cascade.parentField]){
            const cascadeValue=updatedNode[cascade.parentField];
            return cascadeValue?.list?.[0];  //这里必须是一个many2one的字段，里面为字段配置信息
        }
    }
    
    return {};
}

const selectCascadeParentValue=(data,dataPath,field,cascade)=>{
    /*if(Array.isArray(cascade)){
        let cascadeParentValue={};
        cascade.forEach(cascadeItem=>{
            cascadeParentValue={...cascadeParentValue,
                ...(getCascadeItemValue(data,dataPath,field,cascadeItem))     
            }
        })
        return cascadeParentValue;
    }*/
    return getCascadeItemValue(data,dataPath,field,cascade);
};

const resultEqualityCheck=(a,b)=>{
    return (JSON.stringify(a)===JSON.stringify(b));
}

const makeCascadeSelector=()=>{
    return createSelector(
        selectCascadeParentValue,
        (cascadeParentValue)=>{
            return cascadeParentValue;
        },
        {
            memoizeOptions:{
                resultEqualityCheck:resultEqualityCheck 
            }
        }
    );
}

export default function DynamicInput({dataPath,control,field,sendMessageToParent}){
    const selectCascadeValue = useMemo(makeCascadeSelector, [dataPath,control,field]);
    const cascadeParentValue=useSelector(state=>selectCascadeValue(state.data,dataPath,field.field,control.cascade));

    const component=useMemo(()=>{
        //根据cascadeParentValue获取控件配置
        const controlType=cascadeParentValue?.control_type;
        let controlOption={};
        if(controlType==='SingleSelect'){
            //将文本转换为对象
            const optionStr=cascadeParentValue?.control_option;
            if(optionStr&&optionStr.length>0){
                //用逗号分割字符串为数组
                const optionArr=optionStr.split(',');
                const options=optionArr.map(item=>{
                    const option=item.split(':');
                    if(option.length>=2){
                        return {value:option[0],label:option[1]};
                    }
                    return {value:option[0],label:option[0]}; 
                });
                controlOption.options=options;
            } else {
                controlOption.options=[];
            }
        }

        if(controlType==='DatePicker'){
            //支持showTime，format等属性
            const optionStr=cascadeParentValue?.control_option;
            if(optionStr&&optionStr.length>0){
                //用逗号分割字符串为数组
                const optionArr=optionStr.split(',');
                const optionObj={}
                optionArr.forEach(item=>{
                    const option=item.split(':');
                    if(option.length>=2){
                        optionObj[option[0]]=option[1];
                    } else {
                        optionObj[option[0]]=true;
                    }
                });
                controlOption.showTime=optionObj.showTime;
                controlOption.format=optionObj.format;
            }
        }

        console.log('DynamicInput',cascadeParentValue,controlOption,controlType);

        const realControl={...control,...controlOption,controlType};
        return getControl(realControl,field,sendMessageToParent,dataPath);
    },[cascadeParentValue,control]);

    return (
        <div>{component}</div>
    );
}