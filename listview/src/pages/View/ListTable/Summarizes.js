import React, {useContext,useEffect,useMemo,useState} from "react";
import {useSelector} from "react-redux";

import {FRAME_MESSAGE_TYPE} from "../../../utils/constant";
import FrameContext from "../../../components/FrameContext";
import {formatStringNumber} from "../../../utils/functions";
import I18nLabel from "../../../components/I18nLabel";

export default function Summarizes(){
  const {origin,item}=useSelector(state=>state.frame);
  const {currentView} = useSelector(state=>state.data);
  const {modelID,views}=useSelector(state=>state.definition);
  const {selectedRowKeys,filter}=useSelector(state=>state.data.views[state.data.currentView].data);
  
  const {sendMessageToParent}=useContext(FrameContext);
  const [summariesData,setSummariesData]=useState(null);

  const viewConf=useMemo(()=>{
    return views.find(item=>item.viewID===currentView);
  },[currentView,views]);

  const searchFields=useMemo(()=>{
    if(viewConf?.footer?.summarizes?.fields.length>0){
      return viewConf.footer.summarizes.fields.map(item=>({field:item.field,summarize:item.summarize}));
    }
    return [];
  },[viewConf]);

  const debounceDelay=viewConf?.footer?.summarizes?.options?.debounceDelay||1000;

  useEffect(()=>{
    if(searchFields.length>0){
      const querySummaizesData=()=>{
        let queryFilter={...filter};

        //这里因为前端文本字段增加了空值的查询，查询空值时，字段的条件中带了Op.or，这里需要把带Op.or的条件展开一下
        //首先去掉带Op.or的条件
        const filterFields=Object.keys(queryFilter);
        if(filterFields.length>0){
            const opOrFilter=[];
            filterFields.forEach(key=>{
                if(queryFilter[key]['Op.or']){
                    opOrFilter.push({...queryFilter[key]});
                    delete queryFilter[key];
                    
                }
            });

            if(opOrFilter.length>0){
                queryFilter['Op.and']=opOrFilter;
            }
        }
        //处理Op.or结束


        let relatedFilter=[];
        let filterData=viewConf.filterData;

        if (selectedRowKeys.length>0){
          filterData=[];
          queryFilter={id:{'Op.in':selectedRowKeys}};
        } else {
          //合并视图本身的过滤条件
          if(viewConf.filter&&Object.keys(viewConf.filter).length>0){
              relatedFilter.push(viewConf.filter);
          }

          if(relatedFilter.length>0){
              if(Object.keys(queryFilter).length>0){
                  queryFilter={
                      'Op.and':[queryFilter,...relatedFilter]
                  };
              } else {
                  if(relatedFilter.length===1){
                      queryFilter=relatedFilter[0];
                  } else {
                      queryFilter={
                          'Op.and':relatedFilter
                      };
                  }
              }
          }
        }
        
        const pagination={current:1,pageSize:0};
        const queryParams={
          modelID,
          viewID:currentView,
          filterData:filterData,
          filter:queryFilter,
          pagination:pagination,
          fields:searchFields
        };
        
        const frameParams={
          frameType:item.frameType,
          frameID:item.params.key,
          dataKey:'footer.summarizes',
          origin:origin
        };

        const message={
            type:FRAME_MESSAGE_TYPE.QUERY_REQUEST,
            data:{
                frameParams:frameParams,
                queryParams:queryParams
            }
        }

        sendMessageToParent(message);
      }

      const queryResponse=(event)=>{
        const {type,dataKey,data}=event.data;
        if(type===FRAME_MESSAGE_TYPE.QUERY_RESPONSE&&
            dataKey==='footer.summarizes'){
            console.log('queryResponse',data);
            setSummariesData(data?.summaries);
        }
      }
      window.addEventListener("message",queryResponse);

      const getSummarizes=setTimeout(()=>{
        querySummaizesData();
      },debounceDelay);

      return ()=>{
        clearTimeout(getSummarizes);
        window.removeEventListener("message",queryResponse);
      }
    }
  },[selectedRowKeys]);

  if(searchFields.length>0){
    return (
      <div>{viewConf?.footer?.summarizes?.fields.map(item=>{
        return (<>
          <I18nLabel label={item.label} />
          <span style={{fontWeight:600}}>{formatStringNumber(summariesData?.[item.field],'en-US',item.decimalPlaces??2)}</span>
          <span>&nbsp;&nbsp;&nbsp;</span>
        </>)
      })}</div>
    );
  }

  return null;
}