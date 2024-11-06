import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from "react-redux";
import dayjs from 'dayjs';

import {setDataLoaded} from '../../../redux/reportSlice';
import {FRAME_MESSAGE_TYPE} from '../../../utils/constant';

export default function PDFReport({controlConf,sendMessageToParent,reportID,parentID,frameParams}){
    const {id,minHeight,row,col,colSpan,rowSpan,sqlParameters}=controlConf;

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
                type:FRAME_MESSAGE_TYPE.REPORT_GETPDF,
                data:{
                    frameParams:keyFrameParams,
                    queryParams:{reportID,parentID:parentID,controlID:id,filterData:filterData,sqlParameters:parsedSQLParameters}
                }
            }
            sendMessageToParent(message);
        }
        
    },[id,data,frameParams,reportID,sqlParameters,filterData,sendMessageToParent,dispatch]);

    let wrapperStyle={
        gridColumnStart:col,
        gridColumnEnd:col+colSpan,
        gridRowStart:row,
        gridRowEnd:row+rowSpan,
        backgroundColor:"#FFFFFF",
        minHeight:minHeight,
        overflow:'hidden',
        height:'100%',
        width:'100%',
        overflow:"hidden",
        position:'relative',
        textAlign:'left'
    }

    if(parentID){
        wrapperStyle={
            minHeight:minHeight,
            overflow:'hidden',
            height:'100%',
            width:'100%'
        }
    }

    const dataKey=useMemo(()=>{
        console.log("pdf data:",data);
        return data?.list?.[0]?.key;
    },[data]);

    return (
        <div style={wrapperStyle}>
            {dataKey?.length>0?<embed src={process.env.REACT_APP_SERVICE_API_PREFIX+"/report/getPdfByKey/"+dataKey} width={"100%"} height={"100%"} type="application/pdf" />:null}
        </div>
    )
}