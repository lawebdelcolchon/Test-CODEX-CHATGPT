import { useSelector, useDispatch } from "react-redux";
import { login as loginThunk, logout as logoutThunk } from "../store/slices/authSlice.js";

export default function useAuth() {
  const { user, status, error } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const login = (email, password) => dispatch(loginThunk({ email, password }));
  const logout = () => dispatch(logoutThunk());
  return { user, status, error, login, logout };
}
