import { useEffect } from "react";
import { Table as AntdTable } from 'antd';
import { useDispatch, useSelector } from "react-redux";

import {setDataLoaded} from '../../../redux/reportSlice';
import {FRAME_MESSAGE_TYPE} from '../../../utils/constant';

import './index.css';

export default function Table({controlConf,reportID,sendMessageToParent,frameParams}){
  const {id,option,minHeight,row,col,colSpan,rowSpan}=controlConf;
  const {footer,title,columns,pagination}=option;
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
  },[data,id,frameParams,reportID,filterData,sendMessageToParent,dispatch]);

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

  const titleFunc=()=>{
    const funStr='"use strict";'+
                 'return (function(currentPageData){ '+
                    'try {'+
                    title+
                    '} catch(e) {'+
                    '   console.error(e);'+
                    '   return undefined;'+
                    '}'+
                 '})';
    return Function(funStr)();
  };

  const footerFunc=()=>{
    const funStr='"use strict";'+
                 'return (function(currentPageData){ '+
                    'try {'+
                    footer+
                    '} catch(e) {'+
                    '   console.error(e);'+
                    '   return undefined;'+
                    '}'+
                 '})';
    return Function(funStr)();
  };

  return (
    <div style={wrapperStyle} className="report-table">
      <AntdTable 
        title={titleFunc()}
        size='small' 
        columns={columns} 
        dataSource={data?.list} 
        bordered
        pagination={pagination}
        footer={footerFunc()}
      />
    </div>
  );
}