import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import { reducers as genericReducers } from "./slices/index.js";

// Combinar reducers: auth (manual) + todos los genéricos
const allReducers = {
  auth: authReducer,
  ...genericReducers
};

export const store = configureStore({
  reducer: allReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar estas action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignorar estas field paths en todas las acciones
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignorar estas field paths en el state
        ignoredPaths: ['items.meta.arg'],
      },
    }),
  devTools: import.meta.env.DEV // Solo en desarrollo
});

// Debug info en desarrollo
if (import.meta.env.DEV) {
  console.log('🏪 Redux Store configured with reducers:', Object.keys(allReducers));
  console.log('📦 Generic reducers loaded:', Object.keys(genericReducers));
}
