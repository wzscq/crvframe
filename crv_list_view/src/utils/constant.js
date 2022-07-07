/**
 * 以下为操作类型枚举常量定义
 */
export const OP_TYPE={
    OPEN:'open',//"OP_TYPE_OPEN",   //打开窗口
    CLOSE:'close',//"OP_TYPE_CLOSE",   //关闭窗口
    REQUEST:'request',//"OP_TYPE_REQUEST",   //调用API
    UPDATE_FRAME_DATA:'updateFrameData',//"OP_TYPE_UPDATE_FRAME_DATA",  //更新子框架数据
    RELOAD_FRAME_DATA:'reloadFrameData',//"OP_TYPE_RELOAD_FRAME_DATA", //重新加载页面数据
}

/**
 * 以下为操作返回结果
 */
export const OP_RESULT={
    SUCCESS:'success',//"OP_RESULT_SUCCESS",  //操作成功
    ERROR:'error',//"OP_RESULT_ERROR"  //操作失败
}

/**
 * 以下为打开窗口操作中，指定窗口打开位置的枚举常量定义
 */
export const OPEN_LOCATION={
    TAB:'tab',//"LOCATION_TYPE_TAB",  //在tab页中打开窗口
    CURRENT:'current',//"LOCATION_TYPE_CURRENT",  //打开窗口替换当前页面
    MODAL:'modal',//"LOCATION_TYPE_MODAL"  //以模态框形式打开窗口
}

export const FRAME_MESSAGE_TYPE={
    DO_OPERATION:'doOperation',//"DO_OPERATION",
    INIT:'init',//"INIT",
    UPDATE_DATA:'updateData',//"UPDATE_DATA",
    RELOAD_DATA:'reloadData',//"RELOAD_DATA",
    QUERY_REQUEST:'queryRequest',//"QUERY_REQUEST",
    QUERY_RESPONSE:'queryResponse',//"QUERY_RESPONSE",
    UPDATE_LOCALE:'updateLocale',//"UPDATE_LOCALE"
}

export const DATA_TYPE={
    MODEL_CONF:'modelConf',//"DATA_TYPE_MODEL_CONF",   //模型配置数据
    QUERY_RESULT:'queryResult',//"DATA_TYPE_QUERY_RESULT",   //数据查询结果
}

//字段类型
export const FIELD_TYPE={
	MANY2MANY:'many2many',//"MANY_TO_MANY",
	MANY2ONE:'many2one',//"MANY_TO_ONE",
	ONE2MANY:'one2many',//"ONE_TO_MANY",
	FILE:'file',//"FILE",
}