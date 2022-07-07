import { createSlice } from '@reduxjs/toolkit';
import { message} from 'antd';

import {loginApi,logoutApi} from '../api';
import {userInfoStorage} from '../utils/sessionStorage';
import {getLocaleErrorMessage} from '../utils/localeResources';

const currentUser=userInfoStorage.get();

// Define the initial state using that type
const initialState = {
    ...currentUser,
    pending:false
}

const logout=(state)=>{
  state.userName="";
  state.token="";
  state.appID="";
  state.pending=false;
}

export const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(loginApi.pending, (state, action) => {
      state.pending=true;
    });
    builder.addCase(loginApi.fulfilled, (state, action) => {
      state.pending=false;
      if(action.payload.error&&action.payload.message){
        //message.error(action.payload.message);
        message.error(getLocaleErrorMessage(action.payload));
      } else {
        const loginApiResponse=action.payload.result;
        state.userName=loginApiResponse.userName;
        state.token=loginApiResponse.token;
        state.appID=loginApiResponse.appID;
        userInfoStorage.set(loginApiResponse);
      }
    });
    builder.addCase(loginApi.rejected , (state, action) => {
      state.pending=false;
      if(action.error&&action.error.message){
        message.error(action.error.message);
      }
    });
    builder.addCase(logoutApi.pending, (state, action) => {
      state.pending=true;
      logout(state);
    });
    builder.addCase(logoutApi.fulfilled, (state, action) => {
      state.pending=false;
      if(action.payload.error&&action.payload.message){
        //message.error(action.payload.message);
        message.error(getLocaleErrorMessage(action.payload));
      }
    });
    builder.addCase(logoutApi.rejected , (state, action) => {
      state.pending=false;
      if(action.error&&action.error.message){
        message.error(action.error.message);
      }
    });
  },
})

// Action creators are generated for each case reducer function
//export const {} = loginSlice.actions

export default loginSlice.reducer