// src/pages/Stores.jsx
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hasPermission } from '../utils/permissions.js';
import ContainerLayoutV2 from '../layouts/ContainerLayoutV2.jsx';
import {
  useStoresQuery, 
  useDeleteStoreMutation 
} from '../hooks/queries/useStores.js';

// Componente para mostrar el estado de la tienda
const StoreStatusBadge = ({ active, is_company }) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            active 
              ? 'bg-emerald-500' 
              : 'bg-red-500'
          }`}
        />
        <span className={`text-xs font-medium ${
          active 
            ? 'text-emerald-700' 
            : 'text-red-700'
        }`}>
          {active ? 'Activa' : 'Inactiva'}
        </span>
      </div>
      {is_company && (
        <span className="text-xs font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
          Empresa
        </span>
      )}
    </div>
  );
};

export default function Stores() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Verificar permisos
  const userHasAccess = hasPermission(user, ['all', 'stores']);

  // Handler para navegar a crear tienda
  const handleCreateStore = useCallback(() => {
    navigate('/stores/create');
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
        <p className="text-gray-500 mb-4">No tienes permisos para acceder a las tiendas.</p>
        <p className="text-sm text-gray-400">Permisos actuales: {user?.permissions?.join(', ') || 'No definidos'}</p>
      </div>
    );
  }

  const columnsData = [
    {
      key: "name",
      label: "Tienda",
      accessor: "name",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-ui-fg-base truncate">{row.name || "-"}</span>
          <span className="text-sm text-ui-fg-muted">Código: {row.code_shipping || "-"}</span>
        </div>
      ),
    },
    {
      key: "location",
      label: "Ubicación",
      accessor: "location",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-ui-fg-base">{row.city || "-"}</span>
          <span className="text-sm text-ui-fg-muted">{row.zipcode || "-"}</span>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contacto",
      accessor: "contact",
      render: (row) => (
        <div className="flex flex-col">
          {row.phone && (
            <span className="text-sm text-ui-fg-base">{row.phone}</span>
          )}
          {row.email && (
            <span className="text-sm text-ui-fg-muted">{row.email}</span>
          )}
          {!row.phone && !row.email && (
            <span className="text-sm text-ui-fg-muted">Sin contacto</span>
          )}
        </div>
      ),
    },
    {
      key: "tax_code",
      label: "Código Fiscal",
      accessor: "tax_code",
      render: (row) => (
        <span className="text-center">
          {row.tax_code || "-"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Estado",
      accessor: "status",
      render: (row) => (
        <StoreStatusBadge 
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
        ? new Date(row.created_at).toLocaleDateString("es-ES", { 
            day: "numeric", 
            month: "short", 
            year: "numeric" 
          })
        : "-",
    },
  ];

  // Personalizar el handler de nuevo
  const handleNew = useCallback(() => {
    handleCreateStore();
  }, [handleCreateStore]);

  // Handler personalizado para edición - navegar a la página de edición
  const handleEdit = useCallback((store) => {
    navigate(`/stores/${store.id}/edit`);
  }, [navigate]);

  return (
    <>
      <ContainerLayoutV2
        resourceName="stores"
        columnsData={columnsData}
        orderKeys={["name", "short_name", "city", "tax_code", "active", "created_at"]}
        emptyMessage="No se encontraron tiendas"
        useListQuery={useStoresQuery}
        useDeleteMutation={useDeleteStoreMutation}
        requiredPermissions={['all', 'stores']}
        defaultPageSize={20}
        defaultSort={{ field: 'created_at', order: 'desc' }}
        onNew={handleNew}
        onEdit={handleEdit}
        viewPath="/stores/:id"
        editPath="/stores/:id/edit"
        createPath="/stores/create"
      />
    </>
  );
}