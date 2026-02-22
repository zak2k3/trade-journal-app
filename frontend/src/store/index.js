import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import tradesReducer from './tradesSlice';
import analyticsReducer from './analyticsSlice';
import tagsReducer from './tagsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trades: tradesReducer,
    analytics: analyticsReducer,
    tags: tagsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;