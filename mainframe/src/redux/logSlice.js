import { createSlice } from '@reduxjs/toolkit';

// Define the initial state using that type
const initialState = {
    items:[],
    active:false,
}

export const logSlice = createSlice({
    name: 'log',
    initialState,
    reducers: {
        info: (state,action) => {
            console.log(action.payload);
            state.items.push(action.payload);            
        },
        setActive:(state,action) => {
            state.active=action.payload;   
            state.items=[];         
        },
    }
});

// Action creators are generated for each case reducer function
export const {info,setActive} = logSlice.actions

export default logSlice.reducer