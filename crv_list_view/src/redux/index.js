import { configureStore } from '@reduxjs/toolkit'

import frameReducer from './frameSlice';
import dataReducer from './dataSlice';
import definitionReducer from './definitionSlice';
import i18nReducer from './i18nSlice';

export default configureStore({
  reducer: {
    frame:frameReducer,
    data:dataReducer,
    definition:definitionReducer,
    i18n:i18nReducer
  }
});