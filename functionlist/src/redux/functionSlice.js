import { createSlice } from '@reduxjs/toolkit';

// Define the initial state using that type
const initialState = {
    items:[]
}

export const functionSlice = createSlice({
    name: 'function',
    initialState,
    reducers: {
        setFunction: (state,action) => {
            console.log(action.payload);
            if(action.payload){
                state.items=action.payload;
            } else {
                state.items=[];
            }
        },
        searchFunction:(state,action)=>{
            state.items.forEach(item=>{
                item.children.forEach(itemFunc=>{
                    if(itemFunc.name.search(action.payload)>-1){
                        itemFunc._show=true;
                    } else {
                        itemFunc._show=false;
                    }
                })
            });
            state.items=[...state.items];   
            console.log(state.items);
        }
    }
});

// Action creators are generated for each case reducer function
export const { setFunction,searchFunction } = functionSlice.actions

export default functionSlice.reducer