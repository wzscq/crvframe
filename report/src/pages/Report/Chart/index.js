import { useEffect, useRef,useMemo } from "react";
import { useResizeDetector } from 'react-resize-detector';
import * as echarts from 'echarts';
import { useDispatch, useSelector } from "react-redux";
import moment from 'moment';

import {setDataLoaded} from '../../../redux/reportSlice';
import {FRAME_MESSAGE_TYPE} from '../../../utils/constant';

export default function Chart({controlConf,reportID,sendMessageToParent,frameParams}){
    const refChart=useRef();
    const { width,ref,height } = useResizeDetector();
    const {id,option,minHeight,row,col,colSpan,rowSpan,sqlParameters}=controlConf;
    const filterData=useSelector(state=>state.data.updated[Object.keys(state.data.updated)[0]]);
    const data=useSelector(state=>state.report.chart[id]);
    const dispatch=useDispatch();

    console.log('Chart refresh',filterData);

    useEffect(()=>{
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
                parsedSQLParameters[key]=Function(funStr)()(moment,filterData);
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
                queryParams:{reportID,controlID:id,sqlParameters:parsedSQLParameters}
            }
        }
        sendMessageToParent(message);
        
    },[id,frameParams,reportID,sqlParameters,filterData,sendMessageToParent,dispatch]);

    const chartOption=useMemo(()=>{
        console.log(data);
        if(data?.loaded===true){
            //根据配置和数据生成系列参数
            if(data.list&&data.list.length>0){
                const chartOption={...option,dataset:{...option.dataset,source:data.list}};
                return chartOption;
            }

            return option;
        }
        return null;
    },[option,data]);
    
    useEffect(()=>{
        if(refChart&&refChart.current&&chartOption!==null){
            let chart=echarts.getInstanceByDom(refChart.current);        
            if(!chart){
                chart=echarts.init(refChart.current);
            }
            chart.setOption(chartOption);
        }
    },
    [refChart,chartOption]);

    useEffect(()=>{
        if(refChart&&refChart.current){
            let chart=echarts.getInstanceByDom(refChart.current);        
            if(chart){
                chart.resize({width:width,height:height});
            }
        }
    },
    [refChart,width,height]);

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
        <div style={wrapperStyle}>
            <div ref={refChart} style={{width:'100%',height:'100%'}} />
            <div ref={ref} style={{width:'100%',height:'100%'}}>{}</div>
        </div>
    );
}