import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    current:null
}

export const dialogSlice = createSlice({
    name: 'dialog',
    initialState,
    reducers: {
        open: (state,action) => {
          state.current=action.payload;
        },
        close:(state) => {
            state.current=null;
        }
    }
});

// Action creators are generated for each case reducer function
export const { open,close} = dialogSlice.actions

export default dialogSlice.reducer