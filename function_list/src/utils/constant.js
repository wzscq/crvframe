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
    UPDATE_LOCALE:'updateLocale',//"UPDATE_LOCALE"
}