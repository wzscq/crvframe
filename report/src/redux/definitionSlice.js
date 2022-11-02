import { createSlice } from '@reduxjs/toolkit';

// Define the initial state using that type
const initialState={
    loaded:false,
    reportConf:null
}

export const definitionSlice = createSlice({
    name: 'definition',
    initialState,
    reducers: {
        setDefinition: (state,action) => {
           state.reportConf=action.payload;
           state.loaded=true;
        }
    }
});

// Action creators are generated for each case reducer function
export const { setDefinition } = definitionSlice.actions

export default definitionSlice.reducer