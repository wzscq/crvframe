import { createSlice } from '@reduxjs/toolkit';

// Define the initial state using that type
const initialState={
    loaded:false,
    reportConf:null,
    appConf:undefined,
    appID:undefined,
    userName:undefined
}

export const definitionSlice = createSlice({
    name: 'definition',
    initialState,
    reducers: {
        setDefinition: (state,action) => {
           state.reportConf=action.payload;
           state.loaded=true;
        },
        setAppConf: (state,action) => {
            state.appConf=action.payload.appConf;
            state.appID=action.payload.appID;
            state.userName=action.payload.userName;
        }
    }
});

// Action creators are generated for each case reducer function
export const { 
    setDefinition,
    setAppConf 
} = definitionSlice.actions

export default definitionSlice.reducer