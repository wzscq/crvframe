import { useEffect,useMemo } from "react";
import { Timeline as TimelineCtl } from 'antd';
import { useDispatch, useSelector } from "react-redux";

import {setDataLoaded} from '../../../redux/reportSlice';
import {FRAME_MESSAGE_TYPE} from '../../../utils/constant';
import Title from './Title';

import './index.css';

export default function DateLine({controlConf,reportID,sendMessageToParent,frameParams}){
  const {id,option,minHeight,row,col,colSpan,rowSpan}=controlConf;
  const {title,label,content}=option;
  const filterData=useSelector(state=>state.data.updated[Object.keys(state.data.updated)[0]]);
  const data=useSelector(state=>state.report.chart[id]);
  const dispatch=useDispatch();

  useEffect(()=>{
    if(data===undefined){
      dispatch(setDataLoaded({controlID:id,loaded:false}));
      //查询数据请求
      const keyFrameParams={
          ...frameParams,
          dataKey:id
      };

      const message={
          type:FRAME_MESSAGE_TYPE.REPORT_QUERY,
          data:{
              frameParams:keyFrameParams,
              queryParams:{reportID,controlID:id,filterData}
          }
      }
      sendMessageToParent(message);
    }
  },[data,id,frameParams,reportID,sendMessageToParent,dispatch]);

  const labelFunc=useMemo(()=>{
    const funStr='"use strict";'+
                 'return (function(data){ '+
                    'try {'+
                      label+
                    '} catch(e) {'+
                    '   console.error(e);'+
                    '   return undefined;'+
                    '}'+
                 '})';
    return Function(funStr)();
  },[label]);

  const contentFunc=useMemo(()=>{
    const funStr='"use strict";'+
                 'return (function(data){ '+
                    'try {'+
                    content+
                    '} catch(e) {'+
                    '   console.error(e);'+
                    '   return undefined;'+
                    '}'+
                 '})';
    return Function(funStr)();
  },[content]);

  const items=useMemo(()=>{
    if(data?.loaded===true){
        //根据配置和数据生成系列参数
        if(data.list&&data.list.length>0){
            return data.list.map(dataItem=>{
              return (<TimelineCtl.Item label={labelFunc(dataItem)}>{contentFunc(dataItem)}</TimelineCtl.Item>);
            });
        }
    }
    return null;
  },[data,labelFunc,contentFunc]);
  
  const wrapperStyle={
    gridColumnStart:col,
    gridColumnEnd:col+colSpan,
    gridRowStart:row,
    gridRowEnd:row+rowSpan,
    backgroundColor:"#FFFFFF",
    minHeight:minHeight,
    overflow:'hidden',
    height:'100%'
  }

  return (
    <div style={wrapperStyle} className='report-dateline'>
      <Title text={title}/>
      <TimelineCtl mode={'left'} >
        {items}
      </TimelineCtl>
    </div>
  );
}