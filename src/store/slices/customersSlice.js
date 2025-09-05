import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { mockApi } from "../../services/api.js";

export const fetchCustomers = createAsyncThunk("customers/list", async (params = {}) => {
  return await mockApi.list("customers", params);
});

const slice = createSlice({
  name: "customers",
  initialState: { items: [], total: 0, status: "idle", error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchCustomers.pending, (s) => { s.status = "loading"; });
    b.addCase(fetchCustomers.fulfilled, (s, a) => { s.status = "succeeded"; s.items = a.payload.items; s.total = a.payload.total; });
    b.addCase(fetchCustomers.rejected, (s, a) => { s.status = "failed"; s.error = a.error.message; });
  }
});

export default slice.reducer;
