import React, { useEffect, useRef } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { useDispatch, useSelector } from "react-redux";
import h337 from 'heatmap.js';
import dayjs from 'dayjs';

import {setDataLoaded} from '../../../redux/reportSlice';
import {FRAME_MESSAGE_TYPE} from '../../../utils/constant';
import PointItem from './PointItem';

import './index.css';

export default function Heatmap({controlConf,sendMessageToParent,reportID,parentID,frameParams}){
    const { width,ref,height } = useResizeDetector();
    const refHeatMap = useRef();

    const {id,option,minHeight,row,col,colSpan,rowSpan,sqlParameters}=controlConf;

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
                    queryParams:{reportID,parentID:parentID,controlID:id,sqlParameters:parsedSQLParameters}
                }
            }
            sendMessageToParent(message);
        }
        
    },[id,data,frameParams,reportID,sqlParameters,filterData,sendMessageToParent,dispatch]);

    useEffect(()=>{
        if(refHeatMap.current&&width>0&&height>0&&data?.loaded===true&&data?.list?.length>0){
            const childs = refHeatMap.current.childNodes; 
            for(let i = 0; i < childs.length; i++) { 
                refHeatMap.current.removeChild(childs[i]); 
            }

            const cfg={
                ...option,
                width:width,
                height:height,
                container:refHeatMap.current
            }
            const inst=h337.create(cfg);
            console.log('heatmap data:',data);
            inst.setData({...option.data,data:data.list});
        }
    },[refHeatMap,width,height,data,option]);


    const pointItems=data?.list?.length>0?data.list.map((item,index)=><PointItem key={index} item={item} />):null;

    let wrapperStyle={
        gridColumnStart:col,
        gridColumnEnd:col+colSpan,
        gridRowStart:row,
        gridRowEnd:row+rowSpan,
        backgroundColor:"#FFFFFF",
        minHeight:minHeight,
        overflow:'hidden',
        height:'100%',
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

    return (
        <div ref={ref} style={wrapperStyle}>
            <img src={option.backgroundImage} alt={""} />
            <div className="heatmap-control">
                <div ref={refHeatMap} />
            </div>
            {pointItems}
        </div>
    )
}