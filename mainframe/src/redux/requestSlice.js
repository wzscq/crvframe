import { createSlice } from '@reduxjs/toolkit';

import {requestAction,downloadAction} from '../api';

// Define the initial state using that type
const initialState = {
    pending:false,
    error:false,
    result:null,
    errorCode:"",
    message:""
}

const downloadReportFile=({data,fileName})=>{
    //let blob=new Blob([data],{type:`application/octet-stream`});
    var a = document.createElement('a');
    var url = window.URL.createObjectURL(data);
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

export const requestSlice = createSlice({
    name: 'request',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(requestAction.pending, (state, action) => {
            state.pending=action.pending;
            state.error=false;
            state.result=null;
            state.message="";
            state.errorCode=0;
        });
        builder.addCase(requestAction.fulfilled, (state, action) => {
            console.log("requst fulfilled:",action);
            state.pending=false;
            state.result=action.payload.result;
            if(action.payload.error){
                state.error=true;
                state.message=action.payload.message;
                state.errorCode=action.payload.errorCode;
            }
        });
        builder.addCase(requestAction.rejected , (state, action) => {
            console.log("requst return error:",action);
            state.pending=false;
            state.error=true;
            if(action.error&&action.error.message){
                state.message=action.error.message;
            } else {
                state.message="未知错误";
            }
        });
        builder.addCase(downloadAction.pending, (state, action) => {
            state.pending=action.pending;
            state.error=false;
            state.result=null;
            state.message="";
            state.errorCode=0;
        });
        builder.addCase(downloadAction.fulfilled, (state, action) => {
            console.log("requst fulfilled:",action);
            state.pending=false;
            downloadReportFile(action.payload);
        });
        builder.addCase(downloadAction.rejected , (state, action) => {
            console.log("requst return error:",action);
            state.pending=false;
            state.error=true;
            if(action.error&&action.error.message){
                state.message=action.error.message;
            } else {
                state.message="未知错误";
            }
        });
    },
});

export default requestSlice.reducer