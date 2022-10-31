import { createSlice } from '@reduxjs/toolkit';
import { message } from 'antd';

import { getUserMenus } from '../api';

// Define the initial state using that type
const initialState = {
    menus:[],
    loaded:false,
    pending:false,
    inlineCollapsed:false
}

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setInlineCollapsed:(state,action) => {
        state.inlineCollapsed=action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserMenus.pending, (state, action) => {
      state.pending=true;
      state.loaded=true;
    });
    builder.addCase(getUserMenus.fulfilled, (state, action) => {
        state.pending=false;
        if(action.payload.error){
            message.error(action.payload.message);
        } else {
            state.menus=action.payload.result;
        }
    });
    builder.addCase(getUserMenus.rejected , (state, action) => {
      state.pending=false;
      if(action.error&&action.error.message){
        message.error(action.error.message);
      }
    });
  },
});

// Action creators are generated for each case reducer function
export const {setInlineCollapsed} = menuSlice.actions;

export default menuSlice.reducer;