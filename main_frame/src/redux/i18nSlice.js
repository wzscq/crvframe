import { createSlice } from '@reduxjs/toolkit';
import { message } from 'antd';

import { getAppI18n } from '../api';
import {setLocaleResources} from '../utils/localeResources';

// Define the initial state using that type
const initialState = {
    locales:[],
    locale:undefined,
    resources:{},
    loaded:false,
    pending:false
}

export const i18nSlice = createSlice({
  name: 'i18n',
  initialState,
  reducers: {
    setLocale:(state,action) => {
        state.locale=action.payload;
        state.loaded=false;   
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAppI18n.pending, (state, action) => {
      state.pending=true;
      state.loaded=true;
    });
    builder.addCase(getAppI18n.fulfilled, (state, action) => {
      state.pending=false;
      if(action.payload.error&&action.payload.message){
        message.error(action.payload.message);
        //如果出错就把语言默认设置未zh_CN,否则子页面打开存在问题
        state.locale='zh_CN';
      } else {
        const response=action.payload.result;
        state.locales=response.locales;
        state.locale=response.locale;
        state.resources=response.resources;
        setLocaleResources(response.resources);
      }
    });
    builder.addCase(getAppI18n.rejected , (state, action) => {
      state.pending=false;
      //如果出错就把语言默认设置未zh_CN,否则子页面打开存在问题
      state.locale='zh_CN';
      if(action.error&&action.error.message){
        message.error(action.error.message);
      }
    });
  },
});

// Action creators are generated for each case reducer function
export const {setLocale} = i18nSlice.actions;

export default i18nSlice.reducer;