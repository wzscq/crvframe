import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { message } from 'antd';
import sha256 from 'crypto-js/sha256';

import {parseUrl} from '../utils/urlParser';
import {userInfoStorage} from '../utils/sessionStorage';
import {
  FRAME_MESSAGE_TYPE
} from "../operation/constant";
import {getLocaleLabel} from '../utils/localeResources';

const decodeToken=(token)=>{
  //从token中获取偶数位字符组成新的字符串
  let decodedToken="";
  for(var i=0; i<token.length; i++) {
    if(i%2 === 0) {
      // 当前字符为奇数维，跳过
      continue;
    }
    decodedToken += token[i];
  }
  return decodedToken;
}

const encodeToken=(token,data)=>{
  token=decodeToken(token);

  let dataStr="";
  if(typeof data === "object" ){
    dataStr=JSON.stringify(data)
  }

  const sum=sha256(dataStr).toString();

  // 新字符串
  let newToken = "";
  // 遍历字符串2，将字符串1的字符插入偶数位
  for(var i = 0; i < sum.length; i++) {
      newToken += sum.charAt(i);
      newToken += token.charAt(i);
  }
  return newToken;
}

export const getHost=()=>{
    const rootElement=document.getElementById('root');
    const host=rootElement?.getAttribute("host");
    return host;
}
  
const host=getHost()+process.env.REACT_APP_SERVICE_API_PREFIX; //'/frameservice';

export const getLoginImage=(appID)=>{
  return host+"/appimages/"+appID+"/login.png";
}

export const getAppIcon=(appID)=>{
  return host+"/appimages/"+appID+"/icon.ico";
}

export const getLogoImage=()=>{
  const {appID}=userInfoStorage.get();
  return host+"/appimages/"+appID+"/logo.png";
}

export const getSmallLogoImage=()=>{
  const {appID}=userInfoStorage.get();
  return host+"/appimages/"+appID+"/logosmall.png";
}

//redire to oauth login page
export const getOAuthLoginPage = createAsyncThunk(
  'getOAuthLoginPage',
  async (param, _) => {
    const reponse= await axios({url:host+"/oauth/getLoginPage",method:"post",data:param});
    console.log('login reponse',reponse);
    return reponse.data;
  }
);

//login api
export const loginApi = createAsyncThunk(
    'login',
    async (param, _) => {
      const reponse= await axios({url:host+"/user/login",method:"post",data:param});
      console.log('login reponse',reponse);
      return reponse.data;
    }
);

//oauthLoginApi
export const oauthLoginApi = createAsyncThunk(
  'oauthLogin',
  async (param, _) => {
    const reponse= await axios({url:host+"/oauth/login",method:"post",data:param});
    console.log('login reponse',reponse);
    return reponse.data;
  }
);

//oauthLoginApi
export const oauthBackApi = createAsyncThunk(
  'oauthBack',
  async (param, _) => {
    const reponse= await axios({url:host+"/oauth/back",method:"post",data:param});
    console.log('login reponse',reponse);
    return reponse.data;
  }
);

//logout api
export const logoutApi = createAsyncThunk(
  'logout',
  async () => {
    const {token}=userInfoStorage.get();
    userInfoStorage.clear();
    const config={
      url:host+"/user/logout",
      method:'post',
      headers:{token:encodeToken(token,"")}
    }
    const reponse= await axios(config);
    return reponse.data;
  }
);

//request api
export const requestAction = createAsyncThunk(
  'request',
  async ({url,method,data,responseType}, _) => {
    console.log('url:'+url+' responseType:'+responseType)
    const {token}=userInfoStorage.get();
    const config={
      url:host+url,
      method,
      data:{...data},
      headers:{token:encodeToken(token,data)},
      responseType:responseType
    }
    const response =await axios(config);
    //判断一下返回的类型，如果是文件流则做一个转换，用来实现文件下载
    if(responseType==='blob'){
      //判断返回类型中是否包含application/json，如果包含则说明是一个错误的返回
      if (response.headers["content-type"].includes("application/json")) {
        const text = await response.data.text();
        try {
          const parsedJSON = JSON.parse(text);
          // 您可以在这里处理 JSON 错误代码，或者直接返回到外部调用
          return parsedJSON;
        } catch (e) {
          console.error("Invalid JSON data");
          throw e;
        }
      }

      let fileName=response.headers['content-disposition'];
      if(fileName){
        fileName=fileName.substring("attachment; filename=".length);
        fileName=decodeURI(fileName);
        return {data:response.data,download:true,fileName:fileName}
      }
    }
    return response.data;
  }
);

//文件下载接口
const DOWNLOAD_FILE_URL="/data/download";
export const downloadAction = createAsyncThunk(
  'download',
  async ({data,fileName}, _) => {
    const {token}=userInfoStorage.get();
    const config={
      url:host+DOWNLOAD_FILE_URL,
      method:'post',
      data:{...data},
      headers:{token:encodeToken(token,data)},
      responseType:'blob'
    }
    const response =await axios(config);
    return {data:response.data,fileName};
  }
);

//大文件下载需要走临时key方式
const GET_DOWN_KEY_URL="/data/getDownloadKey";
const DOWNLOAD_BYKEY_URL="/data/downloadByKey/";
export const downloadByKeyAction = createAsyncThunk(
  'downloadByKey',
  async ({data,fileName}, _) => {
    const {token}=userInfoStorage.get();
    const config={
      url:host+GET_DOWN_KEY_URL,
      method:'post',
      data:{...data},
      headers:{token:encodeToken(token,data)},
    }
    const response =await axios(config);
    return {data:response.data,fileName,url:host+DOWNLOAD_BYKEY_URL};
  }
);

//获取图片文件内容，base64格式，填充到文件的url中，用于图片预览
const GET_IMAGE_URL="/data/getImage";
export const getImage = ({frameParams,queryParams},errorCallback)=>{
  const {token}=userInfoStorage.get();
  const config={
    url:host+GET_IMAGE_URL,
    method:'post',
    data:{...queryParams},
    headers:{token:encodeToken(token,queryParams)}
  }
  axios(config).then(function (response) {
    console.log(response);
    if(response.data.error===true){
      errorCallback(response.data);
    } else {
      const {frameID,frameType,dataKey}=frameParams;
      const frameControl=document.getElementById(frameType+"_"+frameID);
      if(frameControl){
          const origin=parseUrl(frameControl.getAttribute("src")).origin;
          frameControl.contentWindow.postMessage({
            type:FRAME_MESSAGE_TYPE.QUERY_RESPONSE,
            dataKey:dataKey,
            data:response.data.result},origin);
      }
    }
  })
  .catch(function (error) {
    console.log(error);
    message.error(getLocaleLabel({key:'message.main.getImageError',default:'获取图片数据时发生错误'}));
  });
}

//通用的查询接口，用于快速数据查询
const DATA_QUERY_URL="/data/query";
export const queryData = ({frameParams,queryParams},errorCallback)=>{
  const {token}=userInfoStorage.get();
  const config={
    url:host+DATA_QUERY_URL,
    method:'post',
    data:{...queryParams},
    headers:{token:encodeToken(token,queryParams)}
  }
  axios(config).then(function (response) {
    console.log(response);
    if(response.data.error===true){
      //message.error(response.data.message);
      errorCallback(response.data);
    } else {
      const {frameID,frameType,dataKey}=frameParams;
      const frameControl=document.getElementById(frameType+"_"+frameID);
      if(frameControl){
          const origin=parseUrl(frameControl.getAttribute("src")).origin;
          frameControl.contentWindow.postMessage({
            type:FRAME_MESSAGE_TYPE.QUERY_RESPONSE,
            dataKey:dataKey,
            data:response.data.result},origin);
      }
    }
  })
  .catch(function (error) {
    console.log(error);
    message.error(getLocaleLabel({key:'message.main.queryDataError',default:'查询数据时发生错误'}));
  });;
}

//获取文件上传的key
const GET_UPLOAD_KEY_URL="/data/getUploadKey";
export const getUploadKey = ({frameParams,params},errorCallback)=>{
  const {token}=userInfoStorage.get();
  const config={
    url:host+GET_UPLOAD_KEY_URL,
    method:'post',
    data:{...params},
    headers:{token:encodeToken(token,params)}
  }
  axios(config).then(function (response) {
    console.log(response);
    if(response.data.error===true){
      //message.error(response.data.message);
      errorCallback(response.data);
    } else {
      const {frameID,frameType,dataKey}=frameParams;
      const frameControl=document.getElementById(frameType+"_"+frameID);
      if(frameControl){
          const origin=parseUrl(frameControl.getAttribute("src")).origin;
          frameControl.contentWindow.postMessage({
            type:FRAME_MESSAGE_TYPE.GET_UPLOAD_KEY_RESPONSE,
            dataKey:dataKey,
            data:response.data.result},origin);
      }
    }
  })
  .catch(function (error) {
    console.log(error);
    message.error(getLocaleLabel({key:'message.main.queryDataError',default:'查询数据时发生错误'}));
  });;
}

//通用的查询接口，用于报表数据查询
const REPORT_QUERY_URL="/report/query";
export const queryReportData = ({frameParams,queryParams},errorCallback)=>{
  const {token}=userInfoStorage.get();
  const config={
    url:host+REPORT_QUERY_URL,
    method:'post',
    data:{...queryParams},
    headers:{token:encodeToken(token,queryParams)}
  }
  axios(config).then(function (response) {
    console.log(response);
    if(response.data.error===true){
      //message.error(response.data.message);
      errorCallback(response.data);
    } else {
      const {frameID,frameType,dataKey}=frameParams;
      const frameControl=document.getElementById(frameType+"_"+frameID);
      if(frameControl){
          const origin=parseUrl(frameControl.getAttribute("src")).origin;
          frameControl.contentWindow.postMessage({
            type:FRAME_MESSAGE_TYPE.QUERY_RESPONSE,
            dataKey:dataKey,
            data:response.data.result},origin);
      }
    }
  })
  .catch(function (error) {
    console.log(error);
    message.error(getLocaleLabel({key:'message.main.queryDataError',default:'查询数据时发生错误'}));
  });
}

//获取APP支持的语言种类信息，同时返回指定语言资源，
//如果没有和给定语言对应的资源则返回默认的语言资源
const DEF_I18N_URL="/appI18n/";
export const getAppI18n = createAsyncThunk(
  'getAppI18n',
  async ({appID,locale}, _) => {
    const reponse= await axios({url:host+DEF_I18N_URL+appID+'/'+locale,method:"get"});
    console.log('getAppI18n reponse',reponse);
    return reponse.data;
  }
);

//获取用户菜单
const DEF_GETUSERMENU_URL="/definition/getUserMenus";
export const getUserMenus = createAsyncThunk(
  'getUserMenus',
  async () => {
    const {token}=userInfoStorage.get();
    const reponse= await axios({
      url:host+DEF_GETUSERMENU_URL,
      method:"post",
      headers:{token:encodeToken(token,"")}
    });
    console.log('getUserMenus reponse',reponse);
    return reponse.data;
  }
);