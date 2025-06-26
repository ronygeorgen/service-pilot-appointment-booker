import { configureStore } from '@reduxjs/toolkit';
import appointmentReducer from './slices/appointmentSlice';
import uiReducer from './slices/uiSlice';
import userReducer from './slices/userSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    appointments: appointmentReducer,
    ui: uiReducer,
    users: userReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});