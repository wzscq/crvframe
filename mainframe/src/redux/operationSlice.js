import { createSlice } from '@reduxjs/toolkit';
import { message} from 'antd';
import {
    OP_RESULT,
    ERROR_CODE,
    createLogoutOperation
} from '../operation';
//import {getLocaleLabel} from '../utils/localeResources';

const initialState = {
    //一组连续的操作中已经执行完成的操作列表
    doneList:[],   
    //当前正执行的操作
    current:null,
    needConfirm:false,
    //允许多个不同的操作放入队列按顺序执行
    queen:[]
}

const inputValidation=(input,inputValidation)=>{
    //inputValidate是一个JS脚本，用于对输入进行校验和转换
    //创建一个函数，用于执行inputValidate脚本
    const funStr='"use strict";'+
            'return (function(input){ '+
                'try {'+
                inputValidation+
                '} catch(e) {'+
                '   console.error(e);'+
                '   return undefined;'+
                '}'+
            '})';
    return Function(funStr)()(input);
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
                //如果当前操作允许排队，则将当前操作放入队列
                if(action.payload.queenable===true){
                    state.queen=[...state.queen,action.payload];
                } else {
                    console.log('hasOperationWhenSet:',action.payload);
                }
                //message.warning('当前操作尚未执行完成，请稍后再试！');
                //message.warning(getLocaleLabel({key:'message.main.hasOperationWhenSet',default:'当前操作尚未执行完成，请稍后再试！'}));
            } else {
                state.current=action.payload;
                state.doneList=[];
            }
        },
        doNextOperation:(state,action) => {
            //从队列中取出下一个操作执行
            if(state.queen.length>0){
                state.current=state.queen[0];
                state.queen=state.queen.slice(1);
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

                    //对操作的输入进行校验何转换处理
                    if(state.current?.inputValidation){
                        const {error,errorCode,message,result}=inputValidation(state.current.input,state.current.inputValidation);
                        if(error===true){
                            console.log("输入校验失败:"+JSON.stringify({error,errorCode,message,result}));
                            state.current.message=message;
                            state.current.errorCode="";
                            state.current.result=OP_RESULT.ERROR;
                            state.doneList.push({...state.current});
                            state.current=state.current.errorOperation;
                            //执行失败，但是没有失败的后续操作，则需要用户确认后关闭操作信息对话框 
                            state.needConfirm=!(state.current);
                        } else {
                            state.current.input=result;
                        }    
                    }

                } else {
                    console.log("operationDone",errorCode);
                    //执行失败
                    //如果是因为账号过期失败，则自动登出系统
                    if(errorCode===ERROR_CODE.TOKEN_EXPIRED){
                        state.current=createLogoutOperation();    
                    } else {
                        state.current=state.current.errorOperation;
                        //执行失败，但是没有失败的后续操作，则需要用户确认后关闭操作信息对话框 
                        state.needConfirm=!(state.current);
                    }
                    console.log("operationDone",JSON.stringify(state.current));
                }
            } else {
                message.warning("The current operation is not exist when operaiton done！");
            }
        },
    }
});

// Action creators are generated for each case reducer function
export const { setOperation,operationDone,doNextOperation,operationPending,confirm} = operationSlice.actions

export default operationSlice.reducer