import {OP_TYPE,FRAME_MESSAGE_TYPE,DATA_TYPE} from './constant';

const  GET_REPORT_CONF_URL="/definition/getReportConf";

const opUpdateReportConf={
    type:OP_TYPE.UPDATE_FRAME_DATA,
    params:{
        dataType:DATA_TYPE.MODEL_CONF
    }
}

const opGetReportConf={
    type:OP_TYPE.REQUEST,
    params:{
        url:GET_REPORT_CONF_URL,
        method:"post"
    },
    input:{},
    description:{key:'page.report.getReportConfig',default:'获取报表配置信息'}
}

export function createGetReportConfMessage(frameParams,reportID){
    opUpdateReportConf.params={...opUpdateReportConf.params,...frameParams};
    opGetReportConf.input={reportID:reportID};
    opGetReportConf.successOperation=opUpdateReportConf;
    return {
        type:FRAME_MESSAGE_TYPE.DO_OPERATION,
        data:{
            operationItem:opGetReportConf
        }
    };
}

const DATA_QUERY_URL="/data/query";

const opUpdateData={
    type:OP_TYPE.UPDATE_FRAME_DATA,
    params:{
        dataType:DATA_TYPE.QUERY_RESULT
    }
}

const opQueryData={
    type:OP_TYPE.REQUEST,
    params:{
        url:DATA_QUERY_URL,
        method:"post"
    },
    input:{},
    description:{key:'page.crvformview.queryData',default:'查询模型数据'}
}

/**
 * 查询参数如下
 queryParams={modelID,viewID,filter,pagination,sorter,fields}
 */
export function createQueryDataMessage(frameParams,queryParams){
    opUpdateData.params={...opUpdateData.params,...frameParams};
    opQueryData.input=queryParams;
    opQueryData.successOperation=opUpdateData;
    return {
        type:FRAME_MESSAGE_TYPE.DO_OPERATION,
        data:{
            operationItem:opQueryData
        }
    };   
}

const opDownloadFile={
    type:OP_TYPE.DOWNLOAD_FILE,
    params:{
        fileName:"downloadFile",
    },
    input:{},
    description:{key:'page.crvformview.downloadFile',default:'下载文件'}
}

export function createDownloadFileMessage(file,fileName){
    opDownloadFile.input=file;
    opDownloadFile.params.fileName=fileName;
    return {
        type:FRAME_MESSAGE_TYPE.DO_OPERATION,
        data:{
            operationItem:opDownloadFile
        }
    };   
}