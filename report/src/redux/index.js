import { configureStore } from '@reduxjs/toolkit'

import frameReducer from './frameSlice';
import definitionReducer from './definitionSlice';
import reportReducer from './reportSlice';
import i18nReducer from './i18nSlice';
import dataReducer from './dataSlice';

export default configureStore({
  reducer: {
    frame:frameReducer,
    definition:definitionReducer,
    data:dataReducer,
    i18n:i18nReducer,
    report:reportReducer
  }
});