import { configureStore } from '@reduxjs/toolkit'

import tabReducer from './tabSlice';
import loginReducer from './loginSlice';
import operationReducer from './operationSlice';
import dialogReducer from './dialogSlice';
import requestReducer from './requestSlice';
import logReducer from './logSlice';
import i18nReducer from './i18nSlice';

const store = configureStore({
  reducer: {
    login:loginReducer,
    tab:tabReducer,
    dialog:dialogReducer,
    request:requestReducer,
    log:logReducer,
    i18n:i18nReducer,
    operation:operationReducer
  }
});

export default store