/**
 * 以下为操作类型枚举常量定义
 */
export const OP_TYPE={
    OPEN:'open',  //"OP_TYPE_OPEN",   //打开窗口
    CLOSE:'close',  //"OP_TYPE_CLOSE",   //关闭窗口
    REQUEST:'request',   //"OP_TYPE_REQUEST",   //调用API
    UPDATE_FRAME_DATA:'updateFrameData',//"OP_TYPE_UPDATE_FRAME_DATA",  //更新子框架数据
    RELOAD_FRAME_DATA:'reloadFrameData',//"OP_TYPE_RELOAD_FRAME_DATA", //重新加载页面数据
    LOGOUT:'logout',//"OP_TYPE_LOGOUT",   //退出登录
    MESSAGE:'message',//"OP_TYPE_MESSAGE",  //弹出提示消息
    DOWNLOAD_FILE:'downloadFile' //"OP_TYPE_DOWNLOAD_FILE", //下载文件
}

/**
 * 以下为提示消息类型的定义
 */
export const MESSAGE_TYPE = {
    SUCCESS:'success',
    ERROR:'error',
    INFO:'info'
}

/**
 * 以下为操作返回结果
 */
export const OP_RESULT={
    SUCCESS:'success',//"OP_RESULT_SUCCESS",  //操作成功
    ERROR:'error',//"OP_RESULT_ERROR"  //操作失败
}

export const ERROR_CODE={
    TOKEN_EXPIRED:10000004
}

/**
 * 以下为打开窗口操作中，指定窗口打开位置的枚举常量定义
 */
 export const OPEN_LOCATION={
    TAB:'tab',//"LOCATION_TYPE_TAB",  //在tab页中打开窗口
    CURRENT:'current',//"LOCATION_TYPE_CURRENT",  //打开窗口替换当前页面
    MODAL:'modal',//"LOCATION_TYPE_MODAL"  //以模态框形式打开窗口
}

/**
 * 一下是主框架和iframe的消息通信中传递消息的类型
 */
export const FRAME_MESSAGE_TYPE={
    DO_OPERATION:'doOperation',//"DO_OPERATION",
    INIT:'init',//"INIT",
    UPDATE_DATA:'updateData',//"UPDATE_DATA",
    RELOAD_DATA:'reloadData',//"RELOAD_DATA",
    UPDATE_LOCALE:'updateLocale',//"UPDATE_LOCALE",
    QUERY_REQUEST:'queryRequest',//"QUERY_REQUEST",
    QUERY_RESPONSE:'queryResponse',//"QUERY_RESPONSE",
    GET_IMAGE:'getImage', //"GET_IMAGE"
    REPORT_QUERY:'queryReportData',
    GET_UPLOAD_KEY:'getUploadKey',//"GET_UPLOAD_KEY"
    GET_UPLOAD_KEY_RESPONSE:'getUploadKeyResponse',//"GET_UPLOAD_KEY_RESPONSE"
}

export const DATA_TYPE={
    MODEL_CONF:'modelConf',//"DATA_TYPE_MODEL_CONF",   //模型配置数据
    QUERY_RESULT:'queryResult',//"DATA_TYPE_QUERY_RESULT",   //数据查询结果
    FRAME_PARAMS:'frameParams'
}
