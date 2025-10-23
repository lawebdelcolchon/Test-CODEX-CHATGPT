// src/pages/Suppliers.jsx
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ContainerLayoutV2 from "../layouts/ContainerLayoutV2.jsx";
import { useStatusBadge } from "../hooks/useStatusBadge.jsx";
import { hasPermission } from "../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useSuppliersQuery,
  useDeleteSupplierMutation
} from "../hooks/queries/useSuppliers.js";

// Componente separado para el StatusBadge de suppliers
function SupplierStatusBadge({ active, is_company }) {
  if (active) {
    return useStatusBadge(true, is_company ? 'Empresa' : 'Persona');
  } else {
    return useStatusBadge(false, 'Inactivo');
  }
}

export default function Suppliers() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Verificar permisos
  const userHasAccess = hasPermission(user, ['all', 'suppliers']);

  // Handler para navegar a crear supplier
  const handleCreateSupplier = useCallback(() => {
    navigate('/suppliers/create');
  }, [navigate]);

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
        <p className="text-gray-500 mb-4">No tienes permisos para acceder a los proveedores.</p>
        <p className="text-sm text-gray-400">Permisos actuales: {user?.permissions?.join(', ') || 'No definidos'}</p>
      </div>
    );
  }

  const columnsData = [
    {
      key: "name",
      label: "Nombre",
      accessor: "name",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-ui-fg-base truncate">{row.name || "-"}</span>
          <span className="text-sm text-ui-fg-muted">Código: {row.tax_code || "-"}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      accessor: "email",
      render: (row) => (
        <span className="text-sm text-ui-fg-base">
          {row.email || "-"}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Teléfono",
      accessor: "phone",
      render: (row) => (
        <span className="text-sm text-ui-fg-base">
          {row.phone || "-"}
        </span>
      ),
    },
    {
      key: "city",
      label: "Ciudad",
      accessor: "city",
      render: (row) => (
        <span className="text-sm text-ui-fg-muted">
          {row.city || "-"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Estado",
      accessor: "status",
      render: (row) => (
        <SupplierStatusBadge 
          active={row.active} 
          is_company={row.is_company}
        />
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

  // Personalizar el handler de nuevo
  const handleNew = useCallback(() => {
    handleCreateSupplier();
  }, [handleCreateSupplier]);

  // Handler personalizado para edición - navegar a la página de edición
  const handleEdit = useCallback((supplier) => {
    navigate(`/suppliers/${supplier.id}/edit`);
  }, [navigate]);

  return (
    <>
      <ContainerLayoutV2
        resourceName="suppliers"
        columnsData={columnsData}
        orderKeys={["name", "email", "phone", "city", "status", "created_at"]}
        emptyMessage="No se encontraron proveedores"
        useListQuery={useSuppliersQuery}
        useDeleteMutation={useDeleteSupplierMutation}
        requiredPermissions={['all', 'suppliers']}
        defaultPageSize={20}
        defaultSort={{ field: 'created_at', order: 'desc' }}
        onNew={handleNew}
        onEdit={handleEdit}
        viewPath="/suppliers/:id"
        editPath="/suppliers/:id/edit"
        createPath="/suppliers/create"
      />
    </>
  );
}
