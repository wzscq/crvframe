import { configureStore } from '@reduxjs/toolkit'

import frameReducer from './frameSlice';
import definitionReducer from './definitionSlice';
import dataReducer from './dataSlice';
import i18nReducer from './i18nSlice';

export default configureStore({
  reducer: {
    frame:frameReducer,
    definition:definitionReducer,
    data:dataReducer,
    i18n:i18nReducer
  }
});