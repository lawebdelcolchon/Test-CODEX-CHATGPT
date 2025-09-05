import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../store/slices/authSlice";

export default function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleLogout = async () => {
      await dispatch(logoutUser());
      navigate("/login", { replace: true });
    };
    
    handleLogout();
  }, [dispatch, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <div className="text-gray-600">Cerrando sesión...</div>
      </div>
    </div>
  );
}
