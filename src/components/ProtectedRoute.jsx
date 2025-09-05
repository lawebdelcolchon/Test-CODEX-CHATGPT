import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { checkAuthStatus, validateSession } from "../store/slices/authSlice";

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    // Check auth status on component mount
    dispatch(checkAuthStatus());
    dispatch(validateSession());
  }, [dispatch]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
