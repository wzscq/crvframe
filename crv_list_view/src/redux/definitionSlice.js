import { createSlice } from '@reduxjs/toolkit';

// Define the initial state using that type
const initialState = {
    loaded:false,
    modelID:"",
    fields:[],
    operations:[],
    views:[],
}

console.log("definition",JSON.stringify(initialState));

export const definitionSlice = createSlice({
    name: 'definition',
    initialState,
    reducers: {
        setDefinition: (state,action) => {
           console.log(action.payload);
           state.modelID=action.payload.modelID;
           state.fields=action.payload.fields;
           state.operations=action.payload.operations;
           state.views=action.payload.views;
           state.loaded=true;
        }
    }
});

// Action creators are generated for each case reducer function
export const { setDefinition } = definitionSlice.actions

export default definitionSlice.reducer