import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../services/auth";

export default function AuthLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir al dashboard
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-ui-bg-subtle">
      <Outlet />
    </div>
  );
}
