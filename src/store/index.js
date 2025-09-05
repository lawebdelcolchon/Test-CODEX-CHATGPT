import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import productsReducer from "./slices/productsSlice.js";
import ordersReducer from "./slices/ordersSlice.js";
import customersReducer from "./slices/customersSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    orders: ordersReducer,
    customers: customersReducer
  }
});
