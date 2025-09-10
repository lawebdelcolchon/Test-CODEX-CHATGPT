// src/pages/Categories.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ContainerLayout from "../layouts/ContainerLayout.jsx";
import { useStatusBadge } from "../hooks/useStatusBadge.jsx";
import { categoriesActions } from "../store/slices/index.js";
import { hasPermission } from "../utils/permissions.js";

// Componente separado para el StatusBadge
function StatusBadge({ isActive }) {
  return useStatusBadge(isActive, isActive ? "Activo" : "Inactivo");
}

export default function Categories() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.categories);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Verificar permisos usando el nuevo sistema
  const userHasAccess = hasPermission(user, ['all', 'categories']);

  useEffect(() => {
    // Cargar categorías solo si el usuario está autenticado y tiene permisos
    if (isAuthenticated && userHasAccess && status === 'idle') {
      console.log('📋 Loading categories for user:', {
        user: user?.name || 'Unknown',
        hasAccess: userHasAccess,
        permissionsEnabled: import.meta.env.VITE_ENABLE_PERMISSIONS
      });
      dispatch(categoriesActions.fetchList());
    } else if (!isAuthenticated) {
      console.warn('🚫 User not authenticated, skipping categories load');
    } else if (!userHasAccess) {
      console.warn('🚧 User lacks permission for categories - but this should not happen with permissions disabled');
    }
  }, [dispatch, status, isAuthenticated, user, userHasAccess]);

  // Si no tiene permisos, mostrar mensaje (solo si los permisos están habilitados)
  if (isAuthenticated && !userHasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13-9a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Acceso Denegado</h2>
        <p className="text-gray-500 mb-4">No tienes permisos para acceder a las categorías.</p>
        <p className="text-sm text-gray-400">Permisos actuales: {user?.permissions?.join(', ') || 'No definidos'}</p>
        <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-700">Switch de permisos: {import.meta.env.VITE_ENABLE_PERMISSIONS === '1' ? 'ON' : 'OFF'}</p>
        </div>
      </div>
    );
  }

  const columnsData = [
    {
      key: "name",
      label: "Categoría",
      accessor: "name",
      render: (row) => <span className="truncate">{row.name || "-"}</span>,
    },
    {
      key: "active",
      label: "Estado",
      accessor: "active",
      render: (row) => (
        <StatusBadge isActive={row.active} />
      ),
    },
    {
      key: "created_at",
      label: "Fecha de Creación",
      accessor: "created_at",
      render: (row) => row.created_at
        ? new Date(row.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
        : "-",
    },
  ];

  return (
    <ContainerLayout
      entityName="categories"
      columnsData={columnsData}
      orderKeys={["Categoria", "Estado", "Fecha de Creación"]}
      reduxState={{ items, status, error }}
      emptyMessage="No se encontraron categorías"
    />
  );
}
