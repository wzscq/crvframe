import { createSlice } from '@reduxjs/toolkit';

// Define the initial state using that type
const initialState = {
    locale:undefined,
    resources:{}
}

export const i18nSlice = createSlice({
    name: 'i18n',
    initialState,
    reducers: {
        setLocale: (state,action) => {
            state.locale=action.payload.locale;
            state.resources=action.payload.resources;
        }
    }
});

// Action creators are generated for each case reducer function
export const { setLocale } = i18nSlice.actions

export default i18nSlice.reducer