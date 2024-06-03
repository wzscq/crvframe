import { useEffect,useCallback } from "react";
import { Table as AntdTable } from 'antd';
import { useDispatch, useSelector } from "react-redux";
import dayjs from 'dayjs';

import {setDataLoaded} from '../../../redux/reportSlice';
import {FRAME_MESSAGE_TYPE} from '../../../utils/constant';

import './index.css';

export default function Table({parentID,controlConf,reportID,sendMessageToParent,frameParams,theme}){
  const {id,option,minHeight,row,col,colSpan,rowSpan,sqlParameters}=controlConf;
  const {footer,title,columns,pagination,rowStyle}=option;
  const filterData=useSelector(state=>state.data.updated[Object.keys(state.data.updated)[0]]);
  const data=useSelector(state=>state.report.chart[id]);
  const dispatch=useDispatch();

  useEffect(()=>{
    if(data===undefined){
      dispatch(setDataLoaded({controlID:id,loaded:false}));

      const parsedSQLParameters={};
      if(sqlParameters){
          Object.keys(sqlParameters).forEach(key=>{
              const funStr='"use strict";'+
                  'return (function(moment,filterData){ '+
                      'try {'+
                          sqlParameters[key]+
                      '} catch(e) {'+
                      '   console.error(e);'+
                      '   return undefined;'+
                      '}'+
                  '})';
              parsedSQLParameters[key]=Function(funStr)()(dayjs,filterData);
          });
      }

      //查询数据请求
      const keyFrameParams={
          ...frameParams,
          dataKey:id
      };

      const message={
          type:FRAME_MESSAGE_TYPE.REPORT_QUERY,
          data:{
              frameParams:keyFrameParams,
              queryParams:{reportID,parentID:parentID,controlID:id,filterData,sqlParameters:parsedSQLParameters}
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
    backgroundColor:theme?.wrapper?.style?.backgroundColor??'white',
    minHeight:minHeight,
    overflow:'hidden',
    height:'100%'
  }

  const getCellStyleFunc=(cellStyle)=>{
    const funStr='"use strict";'+
        'return (function(record, rowIndex){ '+
            'try {'+
                cellStyle+
            '} catch(e) {'+
            '   console.error(e);'+
            '   return undefined;'+
            '}'+
        '})';
    return Function(funStr)();
  };

  const tableColumns=columns.map(col=>{
    if(col.cellStyle){
      return {
        ...col,
        onCell:(record,rowIndex)=>{
          const cellStyle=getCellStyleFunc(col.cellStyle)(record,rowIndex);
          return {style:cellStyle};    
        }
      }
    }
    return col;
  });

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

  //可以通过公式控制row的背景色
  const onRow=useCallback((record, rowIndex)=>{
    if(rowStyle){
        const getRowStyleFunc=()=>{
            const funStr='"use strict";'+
                        'return (function(record, rowIndex){ '+
                            'try {'+
                                rowStyle+
                            '} catch(e) {'+
                            '   console.error(e);'+
                            '   return undefined;'+
                            '}'+
                        '})';
            return Function(funStr)();
        };

        const rst=getRowStyleFunc()(record, rowIndex);
        
        const rowStyle={
            style:{backgroundColor:'white',...rst}
        };
        return rowStyle
    }
    return ({
        style:{backgroundColor:'white'}
    });
  },[rowStyle]);

  return (
    <div style={wrapperStyle} className="report-table">
      <AntdTable 
        title={titleFunc()}
        size='small' 
        columns={tableColumns} 
        dataSource={data?.list} 
        bordered
        pagination={pagination}
        onRow={onRow}
        footer={footerFunc()}
      />
    </div>
  );
}