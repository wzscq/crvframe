import { createSlice } from '@reduxjs/toolkit';
import { message} from 'antd';
import {
    OP_RESULT,
    ERROR_CODE,
    createLogoutOperation
} from '../operation';
import {getLocaleLabel} from '../utils/localeResources';

const initialState = {
    //一组连续的操作中已经执行完成的操作列表
    doneList:[],   
    //当前正执行的操作
    current:null,
    needConfirm:false
}

export const operationSlice = createSlice({
    name: 'operation',
    initialState,
    reducers: {
        confirm:(state,action) =>{
            state.current=null;
            state.doneList=[];
            state.needConfirm=false;
        },
        setOperation: (state,action) => {
            //如果当前操作未完成则不允许设置新的操作
            if(state.current){
                console.log('hasOperationWhenSet:',action.payload);
                //message.warning('当前操作尚未执行完成，请稍后再试！');
                message.warning(getLocaleLabel({key:'message.main.hasOperationWhenSet',default:'当前操作尚未执行完成，请稍后再试！'}));
            } else {
                state.current=action.payload;
                state.doneList=[];
            }
        },
        operationPending:(state,action) => {
            state.current.params.pending=action.payload;
        },
        operationDone:(state,action) => {
            //如果当前操作未完成则不允许设置新的操作
            if(state.current){
                let {result,message,output,errorCode}=action.payload;
                state.current.result=result;
                if(state.current.params?.pending){
                    state.current.params.pending=false;
                }
                state.current.output=output;
                state.current.message=message;
                state.current.errorCode=errorCode;
                state.doneList.push({...state.current});
                if(result===OP_RESULT.SUCCESS){
                    //执行成功  
                    //如果前一个操作操作返回了operation,则执行操作返回的operation，
                    //否则执行当前操作的successOperation  
                    if(output&&output.operation){
                        state.current=output.operation;
                    } else {
                        state.current=state.current.successOperation;
                        if(state.current&&output){
                            if(state.current.input){
                                state.current.input={...(state.current.input),...output}
                            } else {
                                state.current.input=output;
                            }
                        }
                    }
                } else {
                    console.log("operationDone",errorCode)
                    //执行失败
                    //如果是因为账号过期失败，则自动登出系统
                    if(errorCode===ERROR_CODE.TOKEN_EXPIRED){
                        state.current=createLogoutOperation();    
                    } else {
                        state.current=state.current.errorOperation;
                        //执行失败，但是没有失败的后续操作，则需要用户确认后关闭操作信息对话框 
                        state.needConfirm=!(state.current);
                    }
                }
            } else {
                message.warning("The current operation is not exist when operaiton done！");
            }
        },
    }
});

// Action creators are generated for each case reducer function
export const { setOperation,operationDone,operationPending,confirm} = operationSlice.actions

export default operationSlice.reducer