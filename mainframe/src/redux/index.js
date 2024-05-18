import { configureStore } from '@reduxjs/toolkit'

import tabReducer from './tabSlice';
import loginReducer from './loginSlice';
import operationReducer from './operationSlice';
import dialogReducer from './dialogSlice';
import requestReducer from './requestSlice';
import logReducer from './logSlice';
import i18nReducer from './i18nSlice';
import oauthReducer from './oauthSlice';
import menuReducer from './menuSlice';
import dataReducer from './dataSlice';
import frameReducer from './frameSlice';
import layoutSlice from './layoutSlice';

const store = configureStore({
  reducer: {
    login:loginReducer,
    tab:tabReducer,
    dialog:dialogReducer,
    request:requestReducer,
    log:logReducer,
    i18n:i18nReducer,
    operation:operationReducer,
    oauth:oauthReducer,
    menu:menuReducer,
    data:dataReducer,
    frame:frameReducer,
    layout:layoutSlice,
  }
});

export default store