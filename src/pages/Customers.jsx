// src/pages/Customers.jsx
import React from "react";
import ContainerLayoutV2 from "../layouts/ContainerLayoutV2.jsx";
import { useStatusBadge } from "../hooks/useStatusBadge.jsx";
import { hasPermission } from "../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useCustomersQuery,
  useDeleteCustomerMutation
} from "../hooks/queries/useCustomers.js";

// Componente separado para el StatusBadge de customers
function StatusBadge({ hasAccount }) {
  return useStatusBadge(hasAccount, hasAccount ? "Registrado" : "Invitado");
}

export default function Customers() {
  const { user } = useSelector((state) => state.auth);

  // Verificar permisos usando el nuevo sistema
  const userHasAccess = hasPermission(user, ['all', 'customers']);

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
        <p className="text-gray-500 mb-4">No tienes permisos para acceder a los clientes.</p>
        <p className="text-sm text-gray-400">Permisos actuales: {user?.permissions?.join(', ') || 'No definidos'}</p>
        <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-700">Switch de permisos: {import.meta.env.VITE_ENABLE_PERMISSIONS === '1' ? 'ON' : 'OFF'}</p>
        </div>
      </div>
    );
  }
  const getInitials = (row) => {
    if (!row) return "C";
    const first = row.first_name?.charAt(0).toUpperCase() || "";
    const last = row.last_name?.charAt(0).toUpperCase() || "";
    return first + last || "C";
  };

  const getAvatarColor = (row) => {
    const colors = ["bg-blue-500","bg-green-500","bg-purple-500","bg-pink-500","bg-indigo-500","bg-yellow-500","bg-red-500","bg-gray-500"];
    if (!row?.id) return colors[0];
    const index = row.id.toString().charCodeAt(row.id.toString().length - 1) % colors.length;
    return colors[index];
  };

  const columnsData = [
    {
      key: "avatar",
      label: "Cliente",
      accessor: "first_name", // Ordenar por nombre
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${getAvatarColor(row)}`}>
            {getInitials(row)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.first_name} {row.last_name}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "company_name",
      label: "Empresa",
      accessor: "company_name",
      render: (row) => <span className="truncate">{row.company_name || "-"}</span>,
    },
    {
      key: "has_account",
      label: "Estado",
      accessor: "has_account",
      render: (row) => (
        <StatusBadge hasAccount={row.has_account} />
      ),
    },
    {
      key: "phone",
      label: "Teléfono",
      accessor: "phone",
      render: (row) => row.phone || "-"
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
      resourceName="customers"
      columnsData={columnsData}
      orderKeys={["Cliente", "Empresa", "Estado", "Teléfono", "Fecha de Creación"]}
      emptyMessage="No se encontraron clientes"
      useListQuery={useCustomersQuery}
      useDeleteMutation={useDeleteCustomerMutation}
      requiredPermissions={['all', 'customers']}
      defaultPageSize={20}
      defaultSort={{ field: 'first_name', order: 'asc' }}
    />
  );
}
