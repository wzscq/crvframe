/**
 * 以下为操作类型枚举常量定义
 */
export const OP_TYPE={
    OPEN:'open',//"OP_TYPE_OPEN",   //打开窗口
    CLOSE:'close',//"OP_TYPE_CLOSE",   //关闭窗口
    REQUEST:'request',//"OP_TYPE_REQUEST",   //调用API
    UPDATE_FRAME_DATA:'updateFrameData',//"OP_TYPE_UPDATE_FRAME_DATA",  //更新子框架数据
    RELOAD_FRAME_DATA:'reloadFrameData',//"OP_TYPE_RELOAD_FRAME_DATA", //重新加载页面数据
    MESSAGE:'message',//"OP_TYPE_MESSAGE",  //弹出提示消息,
    DOWNLOAD_FILE:'downloadFile',//"OP_TYPE_DOWNLOAD_FILE"
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
    GET_IMAGE:'getImage',//"GET_IMAGE",
    UPDATE_LOCALE:'updateLocale',//"UPDATE_LOCALE"
}

export const DATA_TYPE={
    MODEL_CONF:'modelConf',//"DATA_TYPE_MODEL_CONF",   //模型配置数据
    QUERY_RESULT:'queryResult',//"DATA_TYPE_QUERY_RESULT",   //数据查询结果
}

export const FORM_TYPE={
    CREATE:'create',//"FORM_TYPE_CREATE",
    EDIT:'edit',//'FORM_TYPE_EDIT',
    DETAIL:'detail',//'FORM_TYPE_DETAIL',
    UPDATE:'update',//'FORM_TYPE_UPDATE'
}

//系统默认字段，这些字段有特殊用户，用户字段不能和这些字段重复
export const CC_COLUMNS={
	CC_SAVE_TYPE:"_save_type",
	CC_CREATE_TIME:"create_time",
	CC_CREATE_USER:"create_user",
	CC_UPDATE_TIME:"update_time",
	CC_UPDATE_USER:"update_user",
	CC_VERSION:"version",
	CC_ID:"id"
}

//保存数据的类型
export const SAVE_TYPE={
	CREATE:"create",
	UPDATE:"update",
	DELETE:"delete"
}

//字段类型
export const FIELD_TYPE={
	MANY2MANY:'many2many',//"MANY_TO_MANY",
	MANY2ONE:'many2one',//"MANY_TO_ONE",
	ONE2MANY:'one2many',//"ONE_TO_MANY",
	FILE:'file',//"FILE",
}

//字段级联类型
export const CASCADE_TYPE={
	MANY2MANY:'many2many',//"MANY_TO_MANY",
	MANY2ONE:'many2one',//"MANY_TO_ONE",
}