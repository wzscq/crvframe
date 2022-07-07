import { createSlice } from '@reduxjs/toolkit';

// Define the initial state using that type
const initialState = {
    currentView:null,
    views:{
        /*view1:{
            data:{
                modelid:"model1",
                viewId:"view1",
                pagination:{
                    total:26,      //总记录数
                    current:1,      //当前页编号 
                    pageSize:10     //每页记录数
                },
                filter:{        //过滤条件，待细化
                },
                sorter:[],
                selectedRowKeys:[],  //List视图页面中选中行
                fixedColumn:0,
                list:[
                    {id:"admin",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin1",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin2",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin3",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin4",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin5",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin6",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin7",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin8",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin9",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin10",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin11",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin12",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin13",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin14",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin15",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin16",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin17",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin18",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin19",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin20",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin21",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin22",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin23",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin24",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                    {id:"admin25",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注"},
                ],
            }
        },
        view2:{
            data:{
                modelid:"model1",
                viewId:"view2",
                pagination:{
                    total:26,      //总记录数
                    current:1,      //当前页编号 
                    pageSize:10     //每页记录数
                },
                filter:{        //过滤条件，待细化
                },
                sorter:{},
                selectedRowKeys:[],  //List视图页面中选中行
                fixedColumn:0,
                list:[
                    {id:"admin",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注",create_time:"2022-02-07 08:57:00",create_user:'admin',update_time:'2022-02-07 08:57:00',update_user:'admin',version:0},
                    {id:"admin1",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注",create_time:"2022-02-07 08:57:00",create_user:'admin',update_time:'2022-02-07 08:57:00',update_user:'admin',version:0},
                    {id:"admin2",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注",create_time:"2022-02-07 08:57:00",create_user:'admin',update_time:'2022-02-07 08:57:00',update_user:'admin',version:0},
                    {id:"admin3",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注",create_time:"2022-02-07 08:57:00",create_user:'admin',update_time:'2022-02-07 08:57:00',update_user:'admin',version:0},
                    {id:"admin4",user_name_en:"Admin",user_name_zh:"管理员",password:"***",remark:"备注",create_time:"2022-02-07 08:57:00",create_user:'admin',update_time:'2022-02-07 08:57:00',update_user:'admin',version:0},
                ],
            }
        },*/
    },
}

const initViewItem=(viewConf)=>{
    return {
        data:{
            viewID:viewConf.viewID,
            total:26,      //总记录数
            pagination:{
                current:1,      //当前页编号 
                pageSize:10     //每页记录数
            },
            filter:{        //过滤条件，待细化
            },
            sorter:[],
            selectedRowKeys:[],  //List视图页面中选中行
            fixedColumn:0,
            list:[],
            filterValueLabel:{  //这个值仅用于页面显示顾虑条件的值

            }
        },
    }
}

export const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setCurrentView:(state,action) => {
            state.currentView=action.payload;
        },
        setSelectedRowKeys: (state,action) => {
            state.views[state.currentView].data.selectedRowKeys=action.payload;
        },
        setSorter: (state,action) => {
            state.views[state.currentView].data.sorter=action.payload;
        },
        setFieldFilter:(state,action) => {
            const filter=state.views[state.currentView].data.filter;
            state.views[state.currentView].data.filter={...filter,...action.payload};
        },
        resetFieldFilter:(state,action) => {
            delete state.views[state.currentView].data.filter[action.payload];
        },
        setFilter:(state,action) => {
            state.views[state.currentView].data.filter=action.payload;
        },
        setPagination:(state,action) => {
            state.views[state.currentView].data.pagination=action.payload;
        },
        setFixedColumn:(state,action) => {
            state.views[state.currentView].data.fixedColumn=action.payload;
        },
        setData:(state,action) => {
            state.views[state.currentView].data.total=action.payload.total;
            state.views[state.currentView].data.list=action.payload.list;
            state.views[state.currentView].data.selectedRowKeys=[];
        },
        refreshData:(state,action) => {
            const pagination=state.views[state.currentView].data.pagination;
            state.views[state.currentView].data.pagination={...pagination}
        },
        initDataView:(state,action) => {
            const views=action.payload;
            views.forEach((viewItem,index)=>{
                if(index===0){
                    state.currentView=viewItem.viewID;
                }
                state.views[viewItem.viewID]=initViewItem(viewItem);
            });
        },
    }
});

// Action creators are generated for each case reducer function
export const { 
    setData,
    initDataView,
    setCurrentView,
    setFixedColumn,
    setSelectedRowKeys,
    setSorter,
    setFieldFilter,
    resetFieldFilter,
    setPagination,
    refreshData,
    setFilter
} = dataSlice.actions

export default dataSlice.reducer