import { useEffect, useRef,useMemo } from "react";
import { useResizeDetector } from 'react-resize-detector';
import * as echarts from 'echarts';
import { useDispatch, useSelector } from "react-redux";
import dayjs from 'dayjs';

import {setDataLoaded} from '../../../redux/reportSlice';
import {FRAME_MESSAGE_TYPE} from '../../../utils/constant';

const locales={
    zh_CN:'ZH',
    en_US:'EN'
}

export default function Chart({parentID,controlConf,reportID,sendMessageToParent,frameParams,locale,theme}){
    const refChart=useRef();
    const { width,ref,height } = useResizeDetector();
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
            console.log('Chart refresh 2',parentID,locale);
            let chart=echarts.getInstanceByDom(refChart.current);        
            if(chart){
                chart.dispose();
            }
            chart=echarts.init(refChart.current,theme?.chart?.theme??'light', {locale:locales[locale],width:width,height:height});
            chart.setOption(chartOption);
        }
    },
    [refChart,chartOption,locale]);

    useEffect(()=>{
        if(refChart&&refChart.current){
            console.log('Chart refresh',parentID,filterData,height);
            let chart=echarts.getInstanceByDom(refChart.current);        
            if(chart){
                console.log('Chart refresh 1',parentID,filterData,height,width);
                chart.resize({width:width,height:height});
            }
        }
    },
    [refChart,width,height]);

    let wrapperStyle={
        gridColumnStart:col,
        gridColumnEnd:col+colSpan,
        gridRowStart:row,
        gridRowEnd:row+rowSpan,
        backgroundColor:"#FFFFFF",
        minHeight:minHeight,
        overflow:'hidden',
        height:'100%'
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
            <div ref={refChart} style={{width:'100%',height:'100%'}} />
        </div>
    );
}