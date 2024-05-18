import { createSlice } from '@reduxjs/toolkit';

const saveLocalDefintion=(appID,userID,modelID,viewID,fields)=>{
    const key=`${appID}_${userID}_${modelID}_${viewID}`;
    localStorage.setItem(key,JSON.stringify(fields));
}

const mergeLocalDefintion=(appID,userID,modelID,views)=>{
    return views.map(view=>{
        const key=`${appID}_${userID}_${modelID}_${view.viewID}`;
        const fields=JSON.parse(localStorage.getItem(key));
        if(fields){
            const localFields=fields.map(field=>{
                const localField=view.fields.find(f=>f.field===field.field)
                if(localField){
                    return {...localField,width:field.width,visible:field.visible}
                } else {
                    return null
                }
            }).filter(f=>f!==null);

            const newFields=view.fields.map(field=>{
                const localField=fields.find(f=>f.field===field.field)
                if(localField){
                    return null
                } else {
                    return field;
                }
            }).filter(f=>f!==null);
            
            return {...view,fields:[...localFields,...newFields]};
        } else {
            return view;
        }
    });
}

// Define the initial state using that type
const initialState = {
    appID:"",
    userName:"",
    loaded:false,
    modelID:"",
    fields:[],
    operations:[],
    views:[],
    showColumnSettingDialog:false,
    appConf:undefined,
}

export const definitionSlice = createSlice({
    name: 'definition',
    initialState,
    reducers: {
        setDefinition: (state,action) => {
           state.modelID=action.payload.modelID;
           state.fields=action.payload.fields;
           state.operations=action.payload.operations;
           state.views=mergeLocalDefintion(state.appID,state.userName,action.payload.modelID,action.payload.views);
           state.loaded=true;
        },
        setAppConf: (state,action) => {
            state.appConf=action.payload.appConf;
            state.appID=action.payload.appID;
            state.userName=action.payload.userName;
        },
        setViewFields: (state,action) => {
            console.log('setViewFields:',action.payload);
            state.views=state.views.map(item=>{
                if(item.viewID===action.payload.viewID){
                    saveLocalDefintion(state.appID,state.userName,state.modelID,item.viewID,action.payload.fields);
                    return {...item,fields:action.payload.fields};
                }
                return item;
            });
        },
        setViewFieldWidth: (state,action) => {
            console.log('setViewFieldWidth:',action.payload);
            state.views=state.views.map(item=>{
                if(item.viewID===action.payload.viewID){
                    const fields=item.fields.map(f=>{
                        if(f.field===action.payload.field){
                            return {...f,width:action.payload.width};
                        }
                        return f;
                    });
                    saveLocalDefintion(state.appID,state.userName,state.modelID,item.viewID,fields);
                    return {...item,fields:fields};
                }
                return item;
            });
        },
        setShowColumnSettingDialog: (state,action) => {
            state.showColumnSettingDialog=action.payload;
        }
    }
});

// Action creators are generated for each case reducer function
export const { 
    setDefinition,
    setViewFields,
    setShowColumnSettingDialog,
    setViewFieldWidth,
    setAppConf
} = definitionSlice.actions

export default definitionSlice.reducer