// src/pages/Marketplace.jsx
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ContainerLayoutV2 from "../layouts/ContainerLayoutV2.jsx";
import { useStatusBadge } from "../hooks/useStatusBadge.jsx";
import { hasPermission } from "../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useMarketplacesQuery,
  useDeleteMarketplaceMutation
} from "../hooks/queries/useMarketplace.js";

// Componente separado para el StatusBadge de marketplaces
function MarketplaceStatusBadge({ active, visible }) {
  if (active && visible) {
    return useStatusBadge(true, 'Activo');
  } else if (active && !visible) {
    return useStatusBadge(false, 'Oculto');
  } else {
    return useStatusBadge(false, 'Inactivo');
  }
}

export default function Marketplace() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Verificar permisos
  const userHasAccess = hasPermission(user, ['all', 'marketplace']);

  // Handler para navegar a crear marketplace
  const handleCreateMarketplace = useCallback(() => {
    navigate('/marketplace/create');
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
        <p className="text-gray-500 mb-4">No tienes permisos para acceder a los marketplaces.</p>
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
          <span className="text-sm text-ui-fg-muted">Código: {row.code || "-"}</span>
        </div>
      ),
    },
    {
      key: "description",
      label: "Descripción",
      accessor: "description",
      render: (row) => (
        <span className="text-sm text-ui-fg-muted truncate max-w-xs">
          {row.description || "Sin descripción"}
        </span>
      ),
    },
    {
      key: "url",
      label: "URL",
      accessor: "url",
      render: (row) => (
        row.url ? (
          <a 
            href={row.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-ui-tag-blue-text hover:text-ui-tag-blue-text-hover underline truncate max-w-xs block"
          >
            {row.url}
          </a>
        ) : (
          <span className="text-ui-fg-muted">Sin URL</span>
        )
      ),
    },
    {
      key: "status",
      label: "Estado",
      accessor: "status",
      render: (row) => (
        <MarketplaceStatusBadge 
          active={row.active} 
          visible={row.visible} 
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
    handleCreateMarketplace();
  }, [handleCreateMarketplace]);

  // Handler personalizado para edición - navegar a la página de edición
  const handleEdit = useCallback((marketplace) => {
    navigate(`/marketplace/${marketplace.id}/edit`);
  }, [navigate]);

  return (
    <>
      <ContainerLayoutV2
        resourceName="marketplace"
        columnsData={columnsData}
        orderKeys={["name", "description", "url", "status", "created_at"]}
        emptyMessage="No se encontraron marketplaces"
        useListQuery={useMarketplacesQuery}
        useDeleteMutation={useDeleteMarketplaceMutation}
        requiredPermissions={['all', 'marketplace']}
        defaultPageSize={20}
        defaultSort={{ field: 'created_at', order: 'desc' }}
        onNew={handleNew}
        onEdit={handleEdit}
        viewPath="/marketplace/:id"
        editPath="/marketplace/:id/edit"
        createPath="/marketplace/create"
      />
    </>
  );
}