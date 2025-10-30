// src/pages/Affiliates.jsx
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ContainerLayoutV2 from "../layouts/ContainerLayoutV2.jsx";
import { useStatusBadge } from "../hooks/useStatusBadge.jsx";
import { hasPermission } from "../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useAffiliatesQuery,
  useDeleteAffiliateMutation
} from "../hooks/queries/useAffiliates.js";

// Componente separado para el StatusBadge de afiliados
function AffiliateStatusBadge({ active }) {
  return useStatusBadge(active, active ? 'Activo' : 'Inactivo');
}

export default function Affiliates() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Verificar permisos
  const userHasAccess = hasPermission(user, ['all', 'affiliates']);

  // Handler para navegar a crear afiliado
  const handleCreateAffiliate = useCallback(() => {
    navigate('/affiliates/create');
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
        <p className="text-gray-500 mb-4">No tienes permisos para acceder a los afiliados.</p>
        <p className="text-sm text-gray-400">Permisos actuales: {user?.permissions?.join(', ') || 'No definidos'}</p>
      </div>
    );
  }

  const columnsData = [
    {
      key: "name",
      label: "Afiliado",
      accessor: "name",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-ui-fg-base truncate">{row.name || "-"}</span>
          {row.company && <span className="text-sm text-ui-fg-muted">{row.company}</span>}
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      accessor: "email",
      render: (row) => <span className="truncate">{row.email || "-"}</span>,
    },
    {
      key: "phone",
      label: "Teléfono",
      accessor: "phone",
      render: (row) => <span className="truncate">{row.phone || "-"}</span>,
    },
    {
      key: "contacts_count",
      label: "Contactos",
      accessor: "contacts_count",
      render: (row) => (
        <span className="text-center">
          {row.contacts?.length || row.contacts_count || 0}
        </span>
      ),
    },
    {
      key: "zones_count",
      label: "Zonas",
      accessor: "zones_count",
      render: (row) => (
        <span className="text-center">
          {row.zones?.length || row.zones_count || 0}
        </span>
      ),
    },
    {
      key: "status",
      label: "Estado",
      accessor: "status",
      render: (row) => (
        <AffiliateStatusBadge active={row.active} />
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
    handleCreateAffiliate();
  }, [handleCreateAffiliate]);

  // Handler personalizado para edición - navegar a la página de edición
  const handleEdit = useCallback((affiliate) => {
    navigate(`/affiliates/${affiliate.id}/edit`);
  }, [navigate]);

  return (
    <>
      <ContainerLayoutV2
        resourceName="affiliates"
        columnsData={columnsData}
        orderKeys={["name", "email", "phone", "contacts_count", "zones_count", "status", "created_at"]}
        emptyMessage="No se encontraron afiliados"
        useListQuery={useAffiliatesQuery}
        useDeleteMutation={useDeleteAffiliateMutation}
        requiredPermissions={['all', 'affiliates']}
        defaultPageSize={20}
        defaultSort={{ field: 'created_at', order: 'desc' }}
        onNew={handleNew}
        onEdit={handleEdit}
        viewPath="/affiliates/:id"
        editPath="/affiliates/:id/edit"
        createPath="/affiliates/create"
      />
    </>
  );
}
