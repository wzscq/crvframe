import { createSlice } from '@reduxjs/toolkit';
import { message } from 'antd';

import { getUserMenus } from '../api';

// Define the initial state using that type
const initialState = {
    menus:[],
    loaded:false,
    pending:false,
    inlineCollapsed:false,
    errorCode:0,
    selectedKey:null
}

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setInlineCollapsed:(state,action) => {
        state.inlineCollapsed=action.payload;
    },
    resetMenu:(state,action)=>{
      state.menus=initialState.menus;
      state.loaded=initialState.loaded;
      state.pending=initialState.pending;
      state.inlineCollapsed=initialState.inlineCollapsed;
      state.errorCode=initialState.errorCode;
    },
    setSelectedKey:(state,action)=>{
      state.selectedKey=action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getUserMenus.pending, (state, action) => {
      state.pending=true;
      state.loaded=true;
      state.errorCode=0;
    });
    builder.addCase(getUserMenus.fulfilled, (state, action) => {
        state.pending=false;
        if(action.payload.error){
            message.error(action.payload.message);
            state.errorCode=action.payload.errorCode;
        } else {
            state.menus=action.payload.result;
            state.selectedKey=null;
            state.errorCode=0;
        }
    });
    builder.addCase(getUserMenus.rejected , (state, action) => {
      state.pending=false;
      state.errorCode=0;
      if(action.error&&action.error.message){
        message.error(action.error.message);
      }
    });
  },
});

// Action creators are generated for each case reducer function
export const {
  setInlineCollapsed,
  resetMenu,
  setSelectedKey
} = menuSlice.actions;

export default menuSlice.reducer;