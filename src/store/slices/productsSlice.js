import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { mockApi } from "../../services/api.js";

export const fetchProducts = createAsyncThunk("products/list", async (params = {}) => {
  const res = await mockApi.list("products", params);
  return res;
});

export const createProduct = createAsyncThunk("products/create", async (payload) => {
  const res = await mockApi.create("products", payload);
  return res;
});

export const updateProduct = createAsyncThunk("products/update", async ({ id, payload }) => {
  const res = await mockApi.update("products", id, payload);
  return res;
});

export const removeProduct = createAsyncThunk("products/remove", async (id) => {
  const res = await mockApi.remove("products", id);
  return res;
});

const slice = createSlice({
  name: "products",
  initialState: { items: [], total: 0, status: "idle", error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending, (s) => { s.status = "loading"; });
    b.addCase(fetchProducts.fulfilled, (s, a) => {
      s.status = "succeeded"; s.items = a.payload.items; s.total = a.payload.total;
    });
    b.addCase(fetchProducts.rejected, (s, a) => { s.status = "failed"; s.error = a.error.message; });
    b.addCase(createProduct.fulfilled, (s, a) => { s.items.unshift(a.payload); s.total += 1; });
    b.addCase(updateProduct.fulfilled, (s, a) => {
      const idx = s.items.findIndex((x) => x.id === a.payload.id);
      if (idx !== -1) s.items[idx] = a.payload;
    });
    b.addCase(removeProduct.fulfilled, (s, a) => {
      s.items = s.items.filter((x) => x.id !== a.payload.id);
      s.total = Math.max(0, s.total - 1);
    });
  }
});

export default slice.reducer;
