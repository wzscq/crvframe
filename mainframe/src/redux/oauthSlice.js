import { createSlice } from '@reduxjs/toolkit';
import { message} from 'antd';

import {getLocaleErrorMessage} from '../utils/localeResources';
import { getOAuthLoginPage } from '../api';

// Define the initial state using that type
const initialState = {
    oauthLoginPage:null,
    pendding:false,
    loaded:false,
}

export const oauthSlice = createSlice({
    name: 'oauth',
    initialState,
    reducers: {
        
    },
    extraReducers: (builder) => {
        builder.addCase(getOAuthLoginPage.pending, (state, action) => {
          state.pending=true;
          state.loaded=true;
        });
        builder.addCase(getOAuthLoginPage.fulfilled, (state, action) => {
            state.pending=false;
            if(action.payload.error&&action.payload.message){
                //message.error(action.payload.message);
                message.error(getLocaleErrorMessage(action.payload));
            } else {
                state.oauthLoginPage=action.payload.result.url;
            }
        });
        builder.addCase(getOAuthLoginPage.rejected , (state, action) => {
            state.pending=false;
            if(action.error&&action.error.message){
                message.error(action.error.message);
            }
        });
    },
});

// Action creators are generated for each case reducer function
//export const {info,setActive} = oauthSlice.actions

export default oauthSlice.reducer