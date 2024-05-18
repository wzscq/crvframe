import { createSlice } from '@reduxjs/toolkit';

// Define the initial state using that type
const initialState = {
    headerVisible:true,
    menuVisible:true,
    tabHeaderVisible:true,
}

export const layoutSlice = createSlice({
    name: 'layout',
    initialState,
    reducers: {
        setHeaderVisible: (state,action) => {
            state.headerVisible=action.payload;       
        },
        setMenuVisible:(state,action) => {
            state.menuVisible=action.payload;       
        },
        setTabHeaderVisible:(state,action) => {
            state.tabHeaderVisible=action.payload;       
        },
    }
});

// Action creators are generated for each case reducer function
export const {
    setHeaderVisible,
    setMenuVisible,
    setTabHeaderVisible
} = layoutSlice.actions

export default layoutSlice.reducer