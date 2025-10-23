// src/pages/Clients.jsx
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hasPermission } from '../utils/permissions.js';
import ContainerLayoutV2 from '../layouts/ContainerLayoutV2.jsx';
import {
  useClientsQuery, 
  useDeleteClientMutation 
} from '../hooks/queries/useClients.js';

// Componente para mostrar el estado del cliente
const ClientStatusBadge = ({ active }) => {
  return (
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
        {active ? 'Activo' : 'Inactivo'}
      </span>
    </div>
  );
};

export default function Clients() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Verificar permisos
  const userHasAccess = hasPermission(user, ['all', 'clients']);

  // Handler para navegar a crear cliente
  const handleCreateClient = useCallback(() => {
    navigate('/clients/create');
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
        <p className="text-gray-500 mb-4">No tienes permisos para acceder a los clientes.</p>
        <p className="text-sm text-gray-400">Permisos actuales: {user?.permissions?.join(', ') || 'No definidos'}</p>
      </div>
    );
  }

  const columnsData = [
    {
      key: "name",
      label: "Cliente",
      accessor: "name",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-ui-fg-base truncate">
            {row.name && row.lastname ? `${row.name} ${row.lastname}` : (row.name || row.lastname || "-")}
          </span>
          <span className="text-sm text-ui-fg-muted">{row.email || "-"}</span>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contacto",
      accessor: "contact",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-ui-fg-base">{row.phone || "-"}</span>
          <span className="text-sm text-ui-fg-muted">{row.tax_code || "-"}</span>
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
      key: "status",
      label: "Estado",
      accessor: "status",
      render: (row) => (
        <ClientStatusBadge active={row.active} />
      ),
    },
    {
      key: "type",
      label: "Tipo",
      accessor: "type",
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${
          row.is_company 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {row.is_company ? 'Empresa' : 'Individual'}
        </span>
      ),
    },
    {
      key: "date_client",
      label: "Fecha de Cliente",
      accessor: "date_client",
      render: (row) => row.date_client
        ? new Date(row.date_client).toLocaleDateString("es-ES", { 
            day: "numeric", 
            month: "short", 
            year: "numeric" 
          })
        : "-",
    },
  ];

  // Personalizar el handler de nuevo
  const handleNew = useCallback(() => {
    handleCreateClient();
  }, [handleCreateClient]);

  // Handler personalizado para edición - navegar a la página de edición
  const handleEdit = useCallback((client) => {
    navigate(`/clients/${client.id}/edit`);
  }, [navigate]);

  return (
    <>
      <ContainerLayoutV2
        resourceName="clients"
        columnsData={columnsData}
        orderKeys={["name", "lastname", "email", "phone", "city", "active", "is_company", "date_client"]}
        emptyMessage="No se encontraron clientes"
        useListQuery={useClientsQuery}
        useDeleteMutation={useDeleteClientMutation}
        requiredPermissions={['all', 'clients']}
        defaultPageSize={20}
        defaultSort={{ field: 'date_client', order: 'desc' }}
        onNew={handleNew}
        onEdit={handleEdit}
        viewPath="/clients/:id"
        editPath="/clients/:id/edit"
        createPath="/clients/create"
      />
    </>
  );
}