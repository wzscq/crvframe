import { createSlice } from '@reduxjs/toolkit';

// Define the initial state using that type
const initialState = {
    loaded:false,
    modelID:"",
    fields:[],
    operations:[],
    views:[],
    showColumnSettingDialog:false,
}

export const definitionSlice = createSlice({
    name: 'definition',
    initialState,
    reducers: {
        setDefinition: (state,action) => {
           state.modelID=action.payload.modelID;
           state.fields=action.payload.fields;
           state.operations=action.payload.operations;
           state.views=action.payload.views;
           state.loaded=true;
        },
        setViewFields: (state,action) => {
            console.log('setViewFields:',action.payload);
            state.views=state.views.map(item=>{
                if(item.viewID===action.payload.viewID){
                    return {...item,fields:action.payload.fields};
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
    setShowColumnSettingDialog
} = definitionSlice.actions

export default definitionSlice.reducer