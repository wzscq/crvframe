import { createSlice } from '@reduxjs/toolkit';

import {
    OPEN_LOCATION
} from '../operation';

// Define the initial state using that type
const initialState = {
    items:[{
        params:{
            url:process.env.REACT_APP_FUNCTION_LIST_URL,
            title:{key:'page.main.functionList',default:'功能列表'},
            key:'/functions',
            location:OPEN_LOCATION.TAB
        }
    }],
    current:"/functions"
}

export const tabSlice = createSlice({
    name: 'tab',
    initialState,
    reducers: {
        openTab: (state,action) => {
            //先看一下当前要求打开的页面是否已经在打开页面列表中
            let item=state.items.find((item)=>item.params.key===action.payload.params.key);
            if(!item){
                //如果不在打开页面列表中，则将其加入到当前打开页面列表中
                item=action.payload;
                state.items.push(item);
            }
            //当对应的列表设置为当前激活页，目前是通过key来作为唯一标识
            state.current=item.params.key;
        },
        closeTab:(state,action) => {
            //先看一下当前要求打开的页面是否已经在打开页面列表中，同时获取到对应的索引
            let idx=-1;
            let item=state.items.find((item,index)=>{
                idx=index;
                return (item.params.key===action.payload.params.key)
            });
            if(item){
                //如果在已打开页面列表中，则将其从打开页面列表中删除
                state.items.splice(idx,1);
                if(state.current===item.params.key){
                    //如果删除的页是当前打开页，则将当前打开页切换到他后面的页面
                    //如果后面没有页面了，则将当前页切换为他前面的页
                    if(idx>=state.items.length){
                        idx=state.items.length-1;
                    }
                    if(idx>=0){
                        state.current=state.items[idx].params.key;
                    } else {
                        //idx<0说明打开页面列表中已经空了，将当前打开页面页置为空
                        state.current=null;
                    }
                }
            }
        },
        setActiveTab:(state,action)=>{
            state.current=action.payload;
        },
        closeAllTab:(state,action) => {
            state.items=initialState.items;
            state.current=initialState.current;
        }
    }
});

// Action creators are generated for each case reducer function
export const { openTab,closeTab,setActiveTab,closeAllTab} = tabSlice.actions

export default tabSlice.reducer