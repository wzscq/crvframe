import {useCallback, useMemo} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { Space,Tooltip,message} from 'antd';

import { modiData,removeErrorField } from '../../../../../redux/dataSlice';
import I18nLabel from '../../../../../component/I18nLabel';
import { getManyToOneValueFunc } from '../../../../../utils/functions';
import EditTree from './EditTree';
import {
    SAVE_TYPE,
} from '../../../../../utils/constant';

const selectOriginValue=(data,dataPath,field)=>{
    let originNode=data.origin;
    for(let i=0;i<dataPath.length;++i){
        originNode=originNode[dataPath[i]];
        if(!originNode){
            return undefined;
        }
    }
    return originNode[field];
};

const selectUpdatedValue=(data,dataPath,field)=>{
    let updatedNode=data.updated;
    for(let i=0;i<dataPath.length;++i){
        updatedNode=updatedNode[dataPath[i]];
        if(!updatedNode){
            return undefined;
        }
    }
    return updatedNode[field];
};

const selectValueError=(data,dataPath,field)=>{
    const errFieldPath=dataPath.join('.')+'.'+field;
    return data.errorField[errFieldPath];
};

const makeSelector=()=>{
    return createSelector(
        selectOriginValue,
        selectUpdatedValue,
        selectValueError,
        (originValue,updatedValue,valueError)=>{
            return {originValue,updatedValue,valueError};
        }
    );
}

export default function TreeList({dataPath,control,field,sendMessageToParent}){
    const dispatch=useDispatch();
    const [messageApi, contextHolder] = message.useMessage();
    const selectValue=useMemo(makeSelector,[dataPath,control,field]);
    const {originValue,updatedValue,valueError}=useSelector(state=>selectValue(state.data,dataPath,field.field));

    const treeData=useMemo(()=>{
        console.log(updatedValue)
        if(updatedValue){
            const title=control.title?control.title:'id';
            const getChildren=(item)=>{
                if(item?.list?.length>0){
                    return item.list.map(item=>{
                        if(item["_save_type"]===SAVE_TYPE.DELETE){
                            return null
                        }

                        const children=getChildren(item.subtree)
                        
                        let itemTitle=item[title];
                        if(itemTitle===undefined){
                            itemTitle=getManyToOneValueFunc(title)(item);
                        }

                        return {
                            title:itemTitle,
                            key:item.id,
                            children:children,
                            version:item.version
                        }
                    }).filter(item=>item!=null);
                }
                return [];
            }

            const children=getChildren(updatedValue)

            return children
        }
        return [];
    },[updatedValue]);


    const updateData=(newUpdatedValue)=>{
        const getUpdateData=(item)=>{
            if(item?.list?.length>0){
                const updateList=item.list.map(element => {
                    if(element["_save_type"]===SAVE_TYPE.CREATE||element["_save_type"]===SAVE_TYPE.DELETE){
                        //如果当面节点是create或者delete的话那么所有子节点必定也是create或者delete，直接返回节点即可
                        return element;
                    }
                    //先看子节点是否有变化
                    const changedChildren=getUpdateData(element.subtree)
                    if(changedChildren?.length>0){
                        return {...element,subtree:{...element.subtree,list:changedChildren,relatedField:field.relatedField,fieldType:field.fieldType},"_save_type":SAVE_TYPE.UPDATE}
                    }
                    
                    return null;
                }).filter(item=>item!=null);

                return updateList;
            }
            return null;
        }

      
        const updateList=getUpdateData(newUpdatedValue);
        
        dispatch(modiData({
            dataPath:dataPath,
            field:field.field,
            updated:newUpdatedValue,
            update:{
                modelID:newUpdatedValue.modelID,
                fieldType:field.fieldType,
                relatedField:field.relatedField,
                list:updateList
            }}));
        
    }

    const updateData1=(newUpdatedValue)=>{
        const getUpdateData=(item,list)=>{
            if(item?.list?.length>0){
                item.list.forEach(element => {
                    if(element["_save_type"]===SAVE_TYPE.CREATE){
                        list.push({...element});
                    }

                    getUpdateData(element.subtree,list)
                    
                    if(element["_save_type"]===SAVE_TYPE.DELETE){
                        list.push({id:element.id,version:element.version,"_save_type":SAVE_TYPE.DELETE});
                    }
                });
            }
        }

        const list=[];
        getUpdateData(newUpdatedValue,list);
        
        dispatch(modiData({
            dataPath:dataPath,
            field:field.field,
            updated:newUpdatedValue,
            update:{
                modelID:newUpdatedValue.modelID,
                fieldType:field.fieldType,
                relatedField:field.relatedField,
                list:list
            }}));
    }

    const onDeleteItem=useCallback((key)=>{
        console.log("onDeleteItem:"+key);
        //找到key对应的数据
        const removeItemByKey=(org,key)=>{
            if(org?.list?.length>0){
                const list=org.list.map(item=>{
                    if(item.id===key){
                        if(item["_save_type"]===SAVE_TYPE.CREATE){
                            return null;
                        }

                        if(item["_save_type"]!==SAVE_TYPE.DELETE){
                            return {...item,_save_type:SAVE_TYPE.DELETE};
                        }
                    }
                    const children=removeItemByKey(item.subtree,key);
                    return {...item,subtree:children};
                }).filter(item=>item!==null);

                console.log('newUpdatedValue',key,list)

                return {...org,list:list};
            }
            return org;
        }

        const newUpdatedValue=removeItemByKey(updatedValue,key);

        console.log('newUpdatedValue',key,newUpdatedValue);
        updateData(newUpdatedValue);
        
    },[updatedValue]);

    const onAddItem=useCallback((item,key)=>{
        const addItemByParentKey=(org,item,key,parentKey)=>{
            //如果key和parentKey相等，则说明找到对应的父级节点，直接在当前节点下增加新的list项目
            if(key==parentKey){
                const orgList=org?.list??[];
                const newlist=[...orgList,{...item,_save_type:SAVE_TYPE.CREATE}];
                return {...org,list:newlist,fieldType:field.fieldType,relatedField:field.relatedField,modelID:updatedValue.modelID};
            }

            if(org?.list?.length>0){
                const newlist=org.list.map(orgItem=>{
                    const children=addItemByParentKey(orgItem.subtree,item,key,orgItem.id);
                    return {...orgItem,subtree:children};
                });
                return {...org,list:newlist};
            }

            return org;
        }

        const newUpdatedValue=addItemByParentKey(updatedValue,item,key)
        console.log('newUpdatedValue',key,newUpdatedValue);
        updateData(newUpdatedValue);
    },[updatedValue]);

    let treeControl=(<EditTree  
                        treeData={treeData}
                        disabled={control.disabled} 
                        status={valueError?'error':null}
                        showLine={true}
                        onDeleteItem={onDeleteItem}
                        onAddItem={onAddItem}
                        formConf={control.treeForm}
                        sendMessageToParent={sendMessageToParent}
                    />);

    treeControl=valueError?(
        <Tooltip title={<I18nLabel label={valueError.message}/>}>
            {treeControl}
        </Tooltip>):treeControl

    if(control.inline){
        return treeControl;
    }

    const className=valueError?'control-treelist control-treelist-error':'control-treelist control-treelist-normal';
    
    //获取文本输入框的标签，如果form控件配置了label属性则直接使用，
    //如果控件没有配置label属性，则取字段配置的字段name
    const label=control.label?control.label:(field?field.name:"");
   
    return (
        <>
        {contextHolder}
        <div className={className}>
            <Space size={2} direction="vertical" style={{width:'100%'}}>
                <div style={{width:'100%',textAlign:'left'}}>
                    {control.required?(<span style={{color:'red'}}>*</span>):null}
                    <I18nLabel label={label}/>
                </div>
                {treeControl} 
            </Space>
        </div>
        </>
    )
}