import { createSlice } from '@reduxjs/toolkit';
import {
    CC_COLUMNS,
    SAVE_TYPE
} from '../utils/constant';

//全局唯一索引用于新建数据行的key值
var gRowIdx=0;
// Define the initial state using that type
const initialState = {
    loaded:false,
    //原始数据
    origin:{},
    //对数据所做的更新
    update:{},
    //数据的最终状态
    updated:{},
    //校验出错的数据
    errorField:{}
}

//对原始数据中的每个行做转换，将数组转换为以ID为key的map，方便后续访问
const convertListToMap=(row,controls,index)=>{
    for (let controlIdx in controls){
        let {controls:subControls,field /*,modelID,fieldType,associationModelID*/}=controls[controlIdx];
        if(subControls&&field&&row[field]&&row[field].list){
            const list=row[field].list;
            row[field]={
                ...row[field],
                list:{}};
            for(let i=0;i<list.length;++i){
                row[field].list[list[i][CC_COLUMNS.CC_ID]]=convertListToMap({...list[i]},subControls,i);
            }
        }
    }
    //增加一个行号字段，用于标识行的原始顺序
    row[CC_COLUMNS.CC_SN]=index;
    return row;
}

/**
 * 当修改某个行的数据时，需要确认修改的的数据是在哪个层级上
 * 数据层级组织结构是以行号开始，一个行号跟一个字段，接下来再一个行号，跟一个字段名，
 * 层级结构放在一个数组中，类似[rowKey,fieldid,list,rowKey,fieldid,list,rowKey,fieldid,list] 
 */
const getUpdateNodes=(state,dataPath)=>{
    let updateNode=state.update;
    let updatedNode=state.updated;
    
    for(let i=0;i<dataPath.length;++i){
        const key=dataPath[i];
        if(!updateNode[key]){
            if(i%3===0){
                //当前节点是一个rowKey，向修改缓存中放入一个新的数据修改行
                //这里考虑ID字段可能是个引用字段，所以要判断一下ID字段的值是不是一个对象，如果是对象，取对象的value值
                const idObj=updatedNode[key][CC_COLUMNS.CC_ID];
                const idVal=idObj.value?idObj.value:idObj;
                updateNode[key]={
                    [CC_COLUMNS.CC_SAVE_TYPE]:SAVE_TYPE.UPDATE,
                    [CC_COLUMNS.CC_ID]:idVal, //updatedNode[key][CC_COLUMNS.CC_ID],
                    [CC_COLUMNS.CC_VERSION]:updatedNode[key][CC_COLUMNS.CC_VERSION]
                };
            } else {
                //当前节点是一个field，或list节点时，向修改缓存中放入一个空字段对象
                updateNode[key]={};
            }

            if(i===0){
                state.update=updateNode;
            }
        }

        if(!updatedNode[key]){
            if(i%3===0){
                //当前节点是一个rowKey，向已修改数据中放入一个新的数据修改行
                //这里考虑ID字段可能是个引用字段，所以要判断一下ID字段的值是不是一个对象，如果是对象，取对象的value值
                const idObj=updatedNode[key][CC_COLUMNS.CC_ID];
                const idVal=idObj.value?idObj.value:idObj;
                updatedNode[key]={
                    [CC_COLUMNS.CC_SAVE_TYPE]:SAVE_TYPE.UPDATE,
                    [CC_COLUMNS.CC_ID]:idVal, //updatedNode[key][CC_COLUMNS.CC_ID],
                    [CC_COLUMNS.CC_VERSION]:updatedNode[key][CC_COLUMNS.CC_VERSION]
                };
            } else {
                //当前节点是一个field，或list节点时，向已修改数据中放入一个空字段对象
                updatedNode[key]={};
            }

            if(i===0){
                state.update=updatedNode;
            }
        }

        updateNode=updateNode[key];
        updatedNode=updatedNode[key];
    }
    return {updateNode,updatedNode};
}

const getMaxSN=(updatedNode)=>{
    let maxSN=-1;
    Object.keys(updatedNode).forEach(key => {
        if(updatedNode[key][CC_COLUMNS.CC_SN]&&updatedNode[key][CC_COLUMNS.CC_SN]>maxSN){
            maxSN=updatedNode[key][CC_COLUMNS.CC_SN];
        }
    });
    return maxSN++;
}

export const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setData:(state,action) => {
            const {data:{list},controls}=action.payload;
            if(list.length>0){
                //把数组形式的列表转换成以ID为key值的map
                //对于每一层级字段中的的list都要做转换
                for(let i=0;i<list.length;++i){
                    state.origin[list[i]['id']]=convertListToMap({...(list[i])},controls,i);
                    state.updated[list[i]['id']]=convertListToMap({...(list[i])},controls,i);
                }   
            }
            state.loaded=true;
        },
        modiData:(state,action) => {
            const {dataPath,field,update,updated}=action.payload;
            const {updateNode,updatedNode}=getUpdateNodes(state,dataPath);
            updateNode[field]=update;
            updatedNode[field]=updated;
        },
        createRow:(state,action)=>{
            const {dataPath,initData}=action.payload;
            for(let i=0;i<1;i++){
                const rowKey='__c__'+gRowIdx++;
                if(dataPath.length>0){
                    const {updateNode,updatedNode}=getUpdateNodes(state,dataPath);
                    //这里需要考虑新加入的数据行的顺序问题，这里的逻辑是新加入的数据行放在最后
                    const maxSN=getMaxSN(updatedNode);
                    
                    updateNode[rowKey]={[CC_COLUMNS.CC_SAVE_TYPE]:SAVE_TYPE.CREATE,...initData};
                    updatedNode[rowKey]={[CC_COLUMNS.CC_SAVE_TYPE]:SAVE_TYPE.CREATE,[CC_COLUMNS.CC_SN]:maxSN,...initData};
                } else {
                    const maxSN=getMaxSN(state.updated);
                    state.update[rowKey]={[CC_COLUMNS.CC_SAVE_TYPE]:SAVE_TYPE.CREATE,...initData};
                    state.updated[rowKey]={[CC_COLUMNS.CC_SAVE_TYPE]:SAVE_TYPE.CREATE,[CC_COLUMNS.CC_SN]:maxSN,...initData};
                }
            }
        },
        deleteRow:(state,action)=>{
            const {dataPath,rowKey}=action.payload;
            const {updateNode,updatedNode}=getUpdateNodes(state,dataPath);

            if(updatedNode[rowKey][CC_COLUMNS.CC_SAVE_TYPE]===SAVE_TYPE.CREATE){
                delete updateNode[rowKey];    
            } else {
                //这里考虑ID字段可能是个引用字段，所以要判断一下ID字段的值是不是一个对象，如果是对象，取对象的value值
                const idObj=updatedNode[rowKey][CC_COLUMNS.CC_ID];
                const idVal=idObj.value?idObj.value:idObj;
                updateNode[rowKey]={
                    [CC_COLUMNS.CC_SAVE_TYPE]:SAVE_TYPE.DELETE,
                    [CC_COLUMNS.CC_ID]:idVal
                };
            }
            delete updatedNode[rowKey];
        },
        setErrorField:(state,action) => {
            state.errorField=action.payload;
        },
        removeErrorField:(state,action) => {
            delete state.errorField[action.payload];
        },
        refreshData:(state,action) => {
            state.loaded=false;
        },
    }
});

// Action creators are generated for each case reducer function
export const { 
    setData,
    modiData,
    createRow,
    deleteRow,
    setErrorField,
    removeErrorField,
    refreshData
} = dataSlice.actions

export default dataSlice.reducer