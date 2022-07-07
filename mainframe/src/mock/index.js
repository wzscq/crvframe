import axios from 'axios';
import MockAdapter from  'axios-mock-adapter';

import {createOpenOperation,OPEN_LOCATION} from '../operation';
import {DIALOG_TYPE} from '../dialog';

var mock = new MockAdapter(axios);

mock.onPost("/login").reply((config)=>{
    console.log(config);
    if(config.data){
        const dataObj=JSON.parse(config.data);
        if(dataObj.userId==="admin"){
            return [200,{userName: "管理员",token:"admin"}];
        }
    }
    return [500,{userName: "",token:""}];
});

mock.onPost("/changePassword").reply((config)=>{
    console.log(config);
    if(config.data){
        const dataObj=JSON.parse(config.data);
        if(dataObj.passwordOld==="admin"){
            console.log("changePassword retturn 200 ok");
            return [200,{error:false}];
        } else {
            return [200,{error:true,message:"密码错误"}];
        }
    }
    console.log("changePassword retturn 500 error");
    return [500,{error:true,message:"未知错误"}];
});

mock.onPost("/changePassword").reply((config)=>{
    console.log(config);
    if(config.data){
        const dataObj=JSON.parse(config.data);
        if(dataObj.passwordOld==="admin"){
            console.log("changePassword retturn 200 ok");
            return [200,{error:false}];
        } else {
            return [200,{error:true,message:"密码错误"}];
        }
    }
    console.log("changePassword retturn 500 error");
    return [500,{error:true,message:"未知错误"}];
});

mock.onPost("/getFunctionList").reply((config)=>{
    console.log("getFunctionList");
    const opChangePassword=createOpenOperation(
        {
            url:DIALOG_TYPE.CHANGE_PASSWORD,
            location:OPEN_LOCATION.MODAL
        },{},"打开修改用户密码对话框");

    console.log(config);
    const result={
        error:false,
        result:{
            data:{
                list:[
                    {
                        id:1,
                        name:"function group 1",
                        description:"this is function group 1",
                        children:[
                            {id:1,name:"function1_1",description:"this is function 1_1",operation:opChangePassword},
                            {id:2,name:"function1_2",description:"this is function 1_2",operation:opChangePassword},
                            {id:3,name:"function1_3",description:"this is function 1_3",operation:opChangePassword},
                            {id:4,name:"function1_4",description:"this is function 1_4",operation:opChangePassword},
                            {id:5,name:"function1_5",description:"this is function 1_5",operation:opChangePassword},
                            {id:6,name:"function1_6",description:"this is function 1_6",operation:opChangePassword},
                            {id:7,name:"function1_7",description:"this is function 1_7",operation:opChangePassword},
                            {id:8,name:"function1_8",description:"this is function 1_8",operation:opChangePassword}
                        ]
                    },
                    {
                        id:2,
                        name:"function 2",
                        description:"this is function 2",
                        children:[
                            {id:1,name:"function1_1",description:"this is function 2_1",operation:opChangePassword},
                            {id:2,name:"function1_2",description:"this is function 2_2",operation:opChangePassword},
                            {id:3,name:"function1_3",description:"this is function 2_3",operation:opChangePassword},
                            {id:4,name:"function1_4",description:"this is function 2_4",operation:opChangePassword},
                            {id:5,name:"function1_5",description:"this is function 2_5",operation:opChangePassword},
                            {id:6,name:"function1_6",description:"this is function 2_6",operation:opChangePassword},
                            {id:7,name:"function1_7",description:"this is function 2_7",operation:opChangePassword},
                            {id:8,name:"function1_8",description:"this is function 2_8",operation:opChangePassword}
                        ]
                    }
                ]
            }
        }
    }
    return [200,result];
});