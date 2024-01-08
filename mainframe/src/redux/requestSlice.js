import { createSlice } from '@reduxjs/toolkit';

import {
    requestAction,
    downloadAction,
    downloadByKeyAction
} from '../api';

// Define the initial state using that type
const initialState = {
    pending:false,
    error:false,
    result:null,
    errorCode:"",
    message:"",
    params:undefined
}

const downloadFile=({data,fileName})=>{
    let blob=[data];
    var a = document.createElement('a');
    var url = window.URL.createObjectURL(new Blob(blob));
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

const downloadFileByKey=({data,fileName,url})=>{
    console.log('downloadFileByKey',data,fileName,url)
    const {result:{key}}=data;
    let a = document.createElement('a');
    a.href = url+key;
    a.download = fileName;
    a.target = '_blank';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
            state.params=undefined;
        });
        builder.addCase(requestAction.fulfilled, (state, action) => {
            console.log("requst fulfilled:",action);
            state.pending=false;
            //判断是否是文件下载
            if(action.payload.download===true){
                downloadFile(action.payload);
            } else {
                state.result=action.payload.result;
                if(action.payload.error){
                    state.error=true;
                    state.message=action.payload.message;
                    state.errorCode=action.payload.errorCode;
                    state.params=action.payload.params;
                }
            }
        });
        builder.addCase(requestAction.rejected , (state, action) => {
            console.log("requst return error:",action);
            state.pending=false;
            state.error=true;
            state.errorCode='10000050';
            state.message="请求服务接口失败";
            if(action.error&&action.error.message){
                state.params={error:action.error.message};
            } else {
                state.params={error:"未知错误"};
            }
        });
        builder.addCase(downloadAction.pending, (state, action) => {
            state.pending=action.pending;
            state.error=false;
            state.result=null;
            state.message="";
            state.errorCode=0;
            state.params=undefined;
        });
        builder.addCase(downloadAction.fulfilled, (state, action) => {
            console.log("requst fulfilled:",action);
            state.pending=false;
            downloadFile(action.payload);
        });
        builder.addCase(downloadAction.rejected , (state, action) => {
            console.log("requst return error:",action);
            state.pending=false;
            state.error=true;
            state.errorCode='10000050';
            state.message="请求服务接口失败";
            if(action.error&&action.error.message){
                state.params={error:action.error.message};
            } else {
                state.params={error:"未知错误"};
            }
        });
        builder.addCase(downloadByKeyAction.pending, (state, action) => {
            state.pending=action.pending;
            state.error=false;
            state.result=null;
            state.message="";
            state.errorCode=0;
            state.params=undefined;
        });
        builder.addCase(downloadByKeyAction.fulfilled, (state, action) => {
            console.log("requst fulfilled:",action);
            state.pending=false;

            if(action.payload.data.error===false){
                downloadFileByKey(action.payload);
            } else {
                state.error=true;
                state.message=action.payload.data.message;
                state.errorCode=action.payload.data.errorCode;
                state.params=action.payload.data.params;
            }
        });
        builder.addCase(downloadByKeyAction.rejected , (state, action) => {
            console.log("requst return error:",action);
            state.pending=false;
            state.error=true;
            state.errorCode='10000050';
            state.message="请求服务接口失败";
            if(action.error&&action.error.message){
                state.params={error:action.error.message};
            } else {
                state.params={error:"未知错误"};
            }
        });
    },
});

export default requestSlice.reducer