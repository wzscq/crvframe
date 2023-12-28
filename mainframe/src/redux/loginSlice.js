import { createSlice } from '@reduxjs/toolkit';
import { message} from 'antd';

import {loginApi,logoutApi,oauthBackApi} from '../api';
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
  state.initOperations=[];
  state.pending=false;
  state.appConf=undefined;
  state.oauthLogin=false;
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
        //解析token
        //loginApiResponse.token=decodeToken(loginApiResponse.token);
        state.userName=loginApiResponse.userName;
        state.token=loginApiResponse.token;
        state.appID=loginApiResponse.appID;
        state.initOperations=loginApiResponse.initOperations;
        state.appConf=loginApiResponse.appConf;
        userInfoStorage.set(loginApiResponse);
      }
    });
    builder.addCase(loginApi.rejected , (state, action) => {
      state.pending=false;
      if(action.error&&action.error.message){
        message.error(action.error.message);
      }
    });

    //oauth登录后的操作，和本地login的前端操作逻辑一致
    builder.addCase(oauthBackApi.pending, (state, action) => {
      state.pending=true;
    });
    builder.addCase(oauthBackApi.fulfilled, (state, action) => {
      state.pending=false;
      if(action.payload.error&&action.payload.message){
        //message.error(action.payload.message);
        message.error(getLocaleErrorMessage(action.payload));
      } else {
        const loginApiResponse=action.payload.result;
        state.userName=loginApiResponse.userName;
        state.token=loginApiResponse.token;
        state.appID=loginApiResponse.appID;
        state.initOperations=loginApiResponse.initOperations;
        state.appConf=loginApiResponse.appConf;
        state.oauthLogin=true;
        userInfoStorage.set(loginApiResponse);
      }
    });
    builder.addCase(oauthBackApi.rejected , (state, action) => {
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