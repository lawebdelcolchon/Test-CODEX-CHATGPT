// src/pages/Options.jsx
import React from "react";
import ContainerLayoutV2 from "../layouts/ContainerLayoutV2.jsx";
import { useStatusBadge } from "../hooks/useStatusBadge.jsx";
import { hasPermission } from "../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useOptionsQuery,
  useDeleteOptionMutation
} from "../hooks/queries/useOptions.js";

// Componente separado para el StatusBadge
function StatusBadge({ isActive }) {
  return useStatusBadge(isActive, isActive ? "Activo" : "Inactivo");
}

export default function Options() {
  const { user } = useSelector((state) => state.auth);

  // Verificar permisos usando el nuevo sistema
  const userHasAccess = hasPermission(user, ['all', 'options']);

  // Si no tiene permisos, mostrar mensaje
  if (!userHasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13-9a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Acceso Denegado</h2>
        <p className="text-gray-500 mb-4">No tienes permisos para acceder a las opciones.</p>
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
      label: "Opción",
      accessor: "name",
      render: (row) => <span className="truncate">{row.name || "-"}</span>,
    },
    {
      key: "utilities",
      label: "Utilidades",
      accessor: "utilities",
      render: (row) => <span className="truncate">{row.utilities || "-"}</span>,
    },
    {
      key: "position",
      label: "Posición",
      accessor: "position",
      render: (row) => <span className="text-center">{row.position || 0}</span>,
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
    <ContainerLayoutV2
      resourceName="options"
      columnsData={columnsData}
      orderKeys={["Opción", "Utilidades", "Posición", "Estado", "Fecha de Creación"]}
      emptyMessage="No se encontraron opciones"
      useListQuery={useOptionsQuery}
      useDeleteMutation={useDeleteOptionMutation}
      requiredPermissions={['all', 'options']}
      defaultPageSize={20}
      defaultSort={{ field: 'name', order: 'asc' }}
    />
  );
}
