import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { mockApi } from "../../services/api.js";

export const fetchOrders = createAsyncThunk("orders/list", async (params = {}) => {
  return await mockApi.list("orders", params);
});

const slice = createSlice({
  name: "orders",
  initialState: { items: [], total: 0, status: "idle", error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchOrders.pending, (s) => { s.status = "loading"; });
    b.addCase(fetchOrders.fulfilled, (s, a) => { s.status = "succeeded"; s.items = a.payload.items; s.total = a.payload.total; });
    b.addCase(fetchOrders.rejected, (s, a) => { s.status = "failed"; s.error = a.error.message; });
  }
});

export default slice.reducer;
