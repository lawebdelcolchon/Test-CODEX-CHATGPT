// src/pages/AdminAccounts.jsx
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hasPermission } from '../utils/permissions.js';
import ContainerLayoutV2 from '../layouts/ContainerLayoutV2.jsx';
import {
  useAdminAccountsQuery, 
  useDeleteAdminAccountMutation 
} from '../hooks/queries/useAdminAccounts.js';

// Componente para mostrar el estado de la cuenta de administrador
const AdminAccountStatusBadge = ({ active, admin, super_admin }) => {
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
      <div className="flex gap-1">
        {super_admin && (
          <span className="text-xs font-medium text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
            Super Admin
          </span>
        )}
        {admin && !super_admin && (
          <span className="text-xs font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
            Admin
          </span>
        )}
      </div>
    </div>
  );
};

export default function AdminAccounts() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Verificar permisos
  const userHasAccess = hasPermission(user, ['all', 'admin_accounts']);

  // Handler para navegar a crear administrador
  const handleCreateAdminAccount = useCallback(() => {
    navigate('/admin-accounts/create');
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
        <p className="text-gray-500 mb-4">No tienes permisos para acceder a los administradores.</p>
        <p className="text-sm text-gray-400">Permisos actuales: {user?.permissions?.join(', ') || 'No definidos'}</p>
      </div>
    );
  }

  const columnsData = [
    {
      key: "name",
      label: "Administrador",
      accessor: "name",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-ui-fg-base truncate">{row.name || "-"}</span>
          <span className="text-sm text-ui-fg-muted">@{row.user || "-"}</span>
        </div>
      ),
    },
    {
      key: "store",
      label: "Tienda",
      accessor: "store",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-ui-fg-base">{row.store?.name || `Tienda #${row.id_store}`}</span>
          <span className="text-sm text-ui-fg-muted">ID: {row.id_store}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      accessor: "email",
      render: (row) => (
        <span className="text-ui-fg-base">{row.email || "-"}</span>
      ),
    },
    {
      key: "type",
      label: "Tipo",
      accessor: "type",
      render: (row) => (
        <div className="flex flex-col gap-1">
          {row.super_admin && (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full w-fit">
              Super Admin
            </span>
          )}
          {row.admin && !row.super_admin && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full w-fit">
              Admin
            </span>
          )}
          {!row.admin && !row.super_admin && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full w-fit">
              Usuario
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Estado",
      accessor: "status",
      render: (row) => (
        <AdminAccountStatusBadge 
          active={row.active}
          admin={row.admin}
          super_admin={row.super_admin}
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
    handleCreateAdminAccount();
  }, [handleCreateAdminAccount]);

  // Handler personalizado para edición - navegar a la página de edición
  const handleEdit = useCallback((adminAccount) => {
    navigate(`/admin-accounts/${adminAccount.id}/edit`);
  }, [navigate]);

  return (
    <>
      <ContainerLayoutV2
        resourceName="admin-accounts"
        columnsData={columnsData}
        orderKeys={["name", "user", "email", "id_store", "admin", "super_admin", "active", "created_at"]}
        emptyMessage="No se encontraron administradores"
        useListQuery={useAdminAccountsQuery}
        useDeleteMutation={useDeleteAdminAccountMutation}
        requiredPermissions={['all', 'admin_accounts']}
        defaultPageSize={20}
        defaultSort={{ field: 'created_at', order: 'desc' }}
        onNew={handleNew}
        onEdit={handleEdit}
        viewPath="/admin-accounts/:id"
        editPath="/admin-accounts/:id/edit"
        createPath="/admin-accounts/create"
      />
    </>
  );
}