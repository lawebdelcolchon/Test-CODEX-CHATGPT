import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, createProduct, updateProduct, removeProduct } from "../store/slices/productsSlice.js";

export default function useProducts() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.products);
  return {
    ...state,
    list: (params) => dispatch(fetchProducts(params)),
    create: (payload) => dispatch(createProduct(payload)),
    update: (id, payload) => dispatch(updateProduct({ id, payload })),
    remove: (id) => dispatch(removeProduct(id)),
  };
}
