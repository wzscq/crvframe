import { createSlice } from '@reduxjs/toolkit';

// Define the initial state using that type
/*const initialState = {
    loaded:false,
    modelID:"core_user",
    fields:[
        {field:"id",name:"ID",dataType:"varchar"},
        {field:"user_name_en",name:"英文名称",dataType:"varchar"},
        {field:"user_name_zh",name:"中文名称",dataType:"varchar"},
        {field:"password",name:"密码",dataType:"password"},
        {field:"create_time",name:"创建时间",dataType:"datetime"},
        {field:"create_user",name:"创建人",dataType:"varchar"},
        {field:"update_time",name:"更新时间",dataType:"datetime"},
        {field:"update_user",name:"更新人",dataType:"varchar"},
        {field:"remark",name:"备注",dataType:"varchar"},
        {field:"version",name:"数据版本",dataType:"int"}
    ],
    operations:[
        {id:"create",name:"创建"},
        {id:"edit",name:"编辑"},
        {id:"delete",name:"删除"},
        {
            id:"save",
            name:"保存",
            type:"OP_TYPE_REQUEST",
            params:{
                url:"/data/save",
                method:"post"
            },
            description:"保存数据",
            successOperation:{
                type:"OP_TYPE_CLOSE",
                params:{
                    location:"LOCATION_TYPE_MODAL",
                },
                input:{},
                description:"关闭对话框",
                successOperation:{
                    type:"OP_TYPE_MESSAGE",
                    params:{
                        type:"success",
                        content:"保存用户信息成功!",
                        duration:"2",
                    },
                    description:"提示保存数据成功",
                }
            }
        }
    ],
    forms:[
        {
            formID: "form1",
            colCount: 4,
            rowCount: 26,
            rowHeight: 30,
            header:{
                label:"创建用户"
            },
            footer:{
                operations:[
                    {
                        operationID:"save",
                        name:"保存"
                    },
                    {
                        name:"关闭",
                        type:"OP_TYPE_CLOSE",
                        validateFormData:false,
                        params:{
                            location:"LOCATION_TYPE_MODAL",
                        },
                        input:{},
                        description:"关闭对话框"                            
                    },
                ]
            },
            controls: [
                {
                    controlType: "Text",
                    row: 1,
                    col: 1,
                    field: "id", 
                    label: "ID",
                    colSpan: 1,
                    rowSpan: 1,
                    required:true
                }, 
                {
                    controlType: "Text",
                    row: 1,
                    col: 2,
                    field: "user_name_en", 
                    colSpan: 1,
                    rowSpan: 1
                }, 
                {
                    controlType: "Text",
                    row: 1,
                    col: 3,
                    field: "user_name_zh", 
                    colSpan: 1,
                    rowSpan: 1
                }, 
                {
                    controlType: "Password",
                    row: 1,
                    col: 4,
                    field: "password", 
                    colSpan: 1,
                    rowSpan: 1,
                    required:true
                },
                {
                    controlType: "Text",
                    row: 2,
                    col: 1,
                    field: "remark", 
                    colSpan: 4,
                    rowSpan: 2
                }
            ]
        }
    ]
}*/
const initialState={
    loaded:false
}

export const definitionSlice = createSlice({
    name: 'definition',
    initialState,
    reducers: {
        setDefinition: (state,action) => {
           state.modelID=action.payload.modelID;
           state.fields=action.payload.fields;
           state.operations=action.payload.operations;
           state.forms=action.payload.forms;
           state.loaded=true;
        }
    }
});

// Action creators are generated for each case reducer function
export const { setDefinition } = definitionSlice.actions

export default definitionSlice.reducer