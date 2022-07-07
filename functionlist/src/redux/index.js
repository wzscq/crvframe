import { configureStore } from '@reduxjs/toolkit'

import frameReducer from './frameSlice';
import functionReducer from './functionSlice';
import i18nReducer from './i18nSlice';

export default configureStore({
  reducer: {
    frame:frameReducer,
    function:functionReducer,
    i18n:i18nReducer
  }
});