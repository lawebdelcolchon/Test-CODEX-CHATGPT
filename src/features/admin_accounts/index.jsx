// src/features/admin_accounts/index.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@medusajs/ui";
import DataLayout from "../../layouts/DataLayout.jsx";
import { hasPermission } from "../../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useAdminAccountQuery,
  useUpdateAdminAccountMutation,
  useDeleteAdminAccountMutation
} from "../../hooks/queries/useAdminAccounts.js";
import { formatDate } from "../../utils/formatters.js";

export default function AdminAccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  console.log('🔍 AdminAccountDetail: Componente cargado con ID:', id);
  console.log('🔍 AdminAccountDetail: URL actual:', window.location.pathname);
  
  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canEdit = hasPermission(user, ['all', 'admin_accounts']);
  const canDelete = hasPermission(user, ['all', 'admin_accounts']);

  // Usar TanStack Query para obtener datos
  const {
    data: adminAccount,
    isLoading: isAdminAccountLoading,
    error: adminAccountError,
    refetch: refetchAdminAccount
  } = useAdminAccountQuery(id);
  
  console.log('📊 AdminAccountDetail: Estado de datos:', {
    id,
    adminAccount: adminAccount ? 'loaded' : 'not loaded',
    isAdminAccountLoading,
    adminAccountError: adminAccountError?.message
  });

  const isLoading = isAdminAccountLoading;

  // Hooks de mutación
  const updateAdminAccountMutation = useUpdateAdminAccountMutation({
    onSuccess: (updatedAccount) => {
      console.log('✅ AdminAccountDetail: Cuenta actualizada exitosamente:', updatedAccount);
    },
    onError: (error) => {
      console.error('❌ AdminAccountDetail: Error al actualizar cuenta:', error);
      alert('Error al actualizar la cuenta: ' + error.message);
    }
  });

  const deleteAdminAccountMutation = useDeleteAdminAccountMutation({
    onSuccess: (result, deletedId) => {
      if (String(deletedId) === String(id)) {
        navigate('/admin-accounts');
      }
    },
    onError: (error) => {
      alert('Error al eliminar la cuenta: ' + error.message);
    }
  });

  // Detectar si venimos de la página de edición y refetch si es necesario
  useEffect(() => {
    const hasRecentEdit = sessionStorage.getItem('admin_account_just_edited');
    if (hasRecentEdit === id) {
      console.log('🔄 AdminAccountDetail: Refetch forzado después de edición');
      refetchAdminAccount();
      sessionStorage.removeItem('admin_account_just_edited');
    }
  }, [id, refetchAdminAccount]);

  // Manejador para eliminar cuenta
  const handleDelete = async (entity) => {
    console.log('🗑️ Eliminando cuenta de administrador:', entity.id);
    return deleteAdminAccountMutation.mutateAsync(entity.id);
  };

  // Custom handlers
  const customHandlers = {
    onEdit: () => {
      if (!canEdit) {
        console.warn('🚫 Usuario no tiene permisos para editar cuentas de administrador');
        alert('No tienes permisos para editar cuentas de administrador');
        return false;
      }
      // Navegar a la página de edición
      navigate(`/admin-accounts/${id}/edit`);
      return false; // No abrir el drawer
    },
    onDelete: (entity) => {
      if (!canDelete) {
        console.warn('🚫 Usuario no tiene permisos para eliminar cuentas de administrador');
        alert('No tienes permisos para eliminar cuentas de administrador');
        return;
      }
      handleDelete(entity);
    }
  };

  // Render functions for DataLayout
  const renderHeader = ({ entity, ActionsMenu }) => (
    <>
      <h1 className="font-sans font-medium h1-core">{entity.name}</h1>
      <div className="flex items-center gap-x-2">
        <Badge
          variant={entity.active ? "default" : "secondary"}
          size="small"
          className="txt-compact-xsmall-plus bg-ui-bg-subtle text-ui-fg-subtle border-ui-border-base box-border flex w-fit select-none items-center overflow-hidden rounded-md border pl-0 pr-1 leading-none"
        >
          <div className="flex items-center justify-center w-5 h-[18px] [&_div]:w-2 [&_div]:h-2 [&_div]:rounded-sm [&_div]:bg-ui-tag-green-icon">
            <div></div>
          </div>
          {entity.active ? "Activa" : "Inactiva"}
        </Badge>
        {entity.super_admin && (
          <Badge
            variant="default"
            size="small"
            className="txt-compact-xsmall-plus bg-ui-tag-red-bg text-ui-tag-red-text border-ui-tag-red-border"
          >
            🔴 Super Admin
          </Badge>
        )}
        {entity.admin && !entity.super_admin && (
          <Badge
            variant="default"
            size="small"
            className="txt-compact-xsmall-plus bg-ui-tag-blue-bg text-ui-tag-blue-text border-ui-tag-blue-border"
          >
            👤 Admin
          </Badge>
        )}
        <ActionsMenu />
      </div>
    </>
  );

  renderHeader.additionalRows = ({ entity }) => (
    <>
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">ID</p>
        <p className="font-normal font-sans txt-compact-small">#{entity.id}</p>
      </div>
      
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Usuario</p>
        <p className="font-normal font-sans txt-compact-small">@{entity.user || "-"}</p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Email</p>
        <p className="font-normal font-sans txt-compact-small">{entity.email || "-"}</p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Tienda</p>
        <p className="font-normal font-sans txt-compact-small">{entity.store?.name || `Tienda #${entity.id_store}`}</p>
      </div>
    </>
  );

  const renderDetails = ({ entity }) => (
    <div className="flex flex-col gap-y-6">
      {/* Información Personal */}
      <div className="flex flex-col gap-y-4">
        <h3 className="font-sans font-medium txt-compact-medium-plus">Información Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Nombre Completo</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">{entity.name || "-"}</p>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Usuario</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">@{entity.user || "-"}</p>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Email</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">{entity.email || "-"}</p>
          </div>
        </div>
      </div>

      {/* Tienda y Tipo de Cuenta */}
      <div className="flex flex-col gap-y-4">
        <h3 className="font-sans font-medium txt-compact-medium-plus">Tienda y Tipo de Cuenta</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Tienda</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">
              {entity.store?.name || `Tienda #${entity.id_store}`}
            </p>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Tipo de Cuenta</p>
            <div className="flex gap-1">
              {entity.super_admin && (
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  Super Administrador
                </span>
              )}
              {entity.admin && !entity.super_admin && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Administrador
                </span>
              )}
              {!entity.admin && !entity.super_admin && (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                  Usuario
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Estado</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                entity.active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {entity.active ? "Activa" : "Inactiva"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Fechas */}
      <div className="flex flex-col gap-y-4">
        <h3 className="font-sans font-medium txt-compact-medium-plus">Información del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Fecha de Creación</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">
              {entity.created_at ? formatDate(entity.created_at) : "-"}
            </p>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Última Actualización</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">
              {entity.updated_at ? formatDate(entity.updated_at) : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-ui-fg-subtle">Cargando datos de la cuenta...</div>
      </div>
    );
  }

  // Mostrar error
  if (adminAccountError) {
    console.error('❌ AdminAccountDetail: Error al cargar cuenta:', adminAccountError);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-ui-fg-on-color-bg">Error al cargar la cuenta</div>
        <div className="text-ui-fg-subtle text-center">
          {adminAccountError.message || "Ocurrió un error inesperado"}
        </div>
        <button 
          onClick={() => navigate('/admin-accounts')}
          className="px-4 py-2 bg-ui-bg-base border border-ui-border-base rounded-md hover:bg-ui-bg-subtle"
        >
          Volver a Administradores
        </button>
      </div>
    );
  }

  // Mostrar "no encontrado" si no hay datos
  if (!adminAccount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-ui-fg-on-color-bg">Cuenta no encontrada</div>
        <div className="text-ui-fg-subtle text-center">
          No se encontró una cuenta de administrador con el ID: {id}
        </div>
        <button 
          onClick={() => navigate('/admin-accounts')}
          className="px-4 py-2 bg-ui-bg-base border border-ui-border-base rounded-md hover:bg-ui-bg-subtle"
        >
          Volver a Administradores
        </button>
      </div>
    );
  }

  return (
    <DataLayout
      entity={adminAccount}
      entityName="admin-accounts"
      entityPluralName="administradores"
      renderHeader={renderHeader}
      renderMainSections={({ entity }) => (
        <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
          <div className="p-6">
            {renderDetails({ entity })}
          </div>
        </div>
      )}
      renderSidebar={() => null} // Por ahora no mostrar sidebar
      customHandlers={customHandlers}
    />
  );
}