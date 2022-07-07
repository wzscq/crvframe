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
const convertListToMap=(row,controls)=>{
    for (let controlIdx in controls){
        let {controls:subControls,field,modelID,fieldType,associationModelID}=controls[controlIdx];
        if(subControls&&field&&row[field]&&row[field].list){
            const list=row[field].list;
            row[field]={
                ...row[field],
                list:{}};
            for(let i=0;i<list.length;++i){
                row[field].list[list[i][CC_COLUMNS.CC_ID]]=convertListToMap({...list[i]},subControls);
            }
        }
    }
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
                updateNode[key]={
                    [CC_COLUMNS.CC_SAVE_TYPE]:SAVE_TYPE.UPDATE,
                    [CC_COLUMNS.CC_ID]:updatedNode[key][CC_COLUMNS.CC_ID],
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

        updateNode=updateNode[key];
        updatedNode=updatedNode[key];
    }
    return {updateNode,updatedNode};
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
                    state.origin[list[i]['id']]=convertListToMap({...(list[i])},controls);
                    state.updated[list[i]['id']]=convertListToMap({...(list[i])},controls);
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
            const rowKey='__c__'+gRowIdx++;
            const dataPath=action.payload;
            if(dataPath.length>0){
                const {updateNode,updatedNode}=getUpdateNodes(state,dataPath);
                updateNode[rowKey]={[CC_COLUMNS.CC_SAVE_TYPE]:SAVE_TYPE.CREATE};
                updatedNode[rowKey]={[CC_COLUMNS.CC_SAVE_TYPE]:SAVE_TYPE.CREATE};
            } else {
                state.update[rowKey]={[CC_COLUMNS.CC_SAVE_TYPE]:SAVE_TYPE.CREATE};
                state.updated[rowKey]={[CC_COLUMNS.CC_SAVE_TYPE]:SAVE_TYPE.CREATE};
            }
        },
        deleteRow:(state,action)=>{
            const {dataPath,rowKey}=action.payload;
            const {updateNode,updatedNode}=getUpdateNodes(state,dataPath);

            if(updatedNode[rowKey][CC_COLUMNS.CC_SAVE_TYPE]===SAVE_TYPE.CREATE){
                delete updateNode[rowKey];    
            } else {
                updateNode[rowKey]={
                    [CC_COLUMNS.CC_SAVE_TYPE]:SAVE_TYPE.DELETE,
                    [CC_COLUMNS.CC_ID]:updatedNode[rowKey][CC_COLUMNS.CC_ID]
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