import { createSlice } from '@reduxjs/toolkit';

// Define the initial state using that type
const initialState = {
    origin:window.location.origin,
    item:{
        frameType:"mainframe",
        params:{
            key:"___mainframe",
        }
    }
}

export const frameSlice = createSlice({
    name: 'frame',
    initialState,
    reducers: {
        setParam: (state,action) => {
            state.origin=action.payload.origin;
            state.item=action.payload.item;
        }
    }
});

// Action creators are generated for each case reducer function
export const { setParam } = frameSlice.actions

export default frameSlice.reducer