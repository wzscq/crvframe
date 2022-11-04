import { useEffect, useRef,useMemo } from "react";
import { useResizeDetector } from 'react-resize-detector';
import * as echarts from 'echarts';
import { useDispatch, useSelector } from "react-redux";

import {setDataLoaded} from '../../../redux/dataSlice';
import {FRAME_MESSAGE_TYPE} from '../../../utils/constant';

export default function Chart({controlConf,reportID,sendMessageToParent,frameParams}){
    const refChart=useRef();
    const { width,ref,height } = useResizeDetector();
    const {id,option,minHeight,row,col,colSpan,rowSpan}=controlConf;
    const data=useSelector(state=>state.data.chart[id]);
    const dispatch=useDispatch();

    console.log('Chart refresh');

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
                    queryParams:{reportID,controlID:id}
                }
            }
            sendMessageToParent(message);
        }
    },[data,id,frameParams,reportID,sendMessageToParent,dispatch]);

    const chartOption=useMemo(()=>{
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
            <div ref={refChart} style={{width:'100%',height:'100%'}}>{JSON.stringify(option)}</div>
            <div ref={ref} style={{width:'100%',height:'100%'}}>{}</div>
        </div>
    );
}