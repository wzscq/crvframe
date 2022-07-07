import {OP_TYPE} from "./constant";

export const createOpenOperation=(params,input,description)=>{
    return {
        type:OP_TYPE.OPEN,
        params:params,
        input:input,
        description:description
    }
}

export const createCloseOperation=(params,input,description)=>{
    return {
        type:OP_TYPE.CLOSE,
        params:params,
        input:input,
        description:description
    }
}

export const createRequestOperation=(params,input,description)=>{
    params.pending=false;    
    return {
        type:OP_TYPE.REQUEST,
        params:params,
        input:input,
        description:description
    }
}

export const createUpdateFrameOperation=(params,description)=>{
    return {
        type:OP_TYPE.UPDATE_FRAME_DATA,
        params:params,
        input:{},
        description:description
    }
}

export const createLogoutOperation=()=>{
    return {
        type:OP_TYPE.LOGOUT,
        description:"退出登录"
    }
}

