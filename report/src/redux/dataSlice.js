import { createSlice } from '@reduxjs/toolkit';
//以配置项中的ID为KEY值索引每个Chart的数据
const initialState = {
    chart:{}
}

export const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setData:(state,action) => {
            const {list,controlID}=action.payload;
            state.chart[controlID]={loaded:true,list};
        },
        setDataLoaded:(state,action)=>{
            const {loaded,controlID}=action.payload;
            state.chart[controlID]={loaded};
        },
        refreshData:(state,action) => {
            state.chart={};
        },
    }
});

// Action creators are generated for each case reducer function
export const { 
    setData,
    setDataLoaded,
    refreshData} = dataSlice.actions

export default dataSlice.reducer