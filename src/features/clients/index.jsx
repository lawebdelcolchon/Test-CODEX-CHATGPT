// src/features/clients/index.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@medusajs/ui";
import DataLayout from "../../layouts/DataLayout.jsx";
import { hasPermission } from "../../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useClientQuery,
  useUpdateClientMutation,
  useDeleteClientMutation
} from "../../hooks/queries/useClients.js";
import { useStoreQuery } from "../../hooks/queries/useStores.js";
import { useAffiliateQuery } from "../../hooks/queries/useAffiliates.js";
import { formatDate } from "../../utils/formatters.js";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  console.log('🔍 ClientDetail: Componente cargado con ID:', id);
  console.log('🔍 ClientDetail: URL actual:', window.location.pathname);
  
  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canEdit = hasPermission(user, ['all', 'clients']);
  const canDelete = hasPermission(user, ['all', 'clients']);

  // Usar TanStack Query para obtener datos
  const {
    data: client,
    isLoading: isClientLoading,
    error: clientError,
    refetch: refetchClient
  } = useClientQuery(id);
  
  // Obtener datos relacionados
  const { data: store, isLoading: storeLoading } = useStoreQuery(client?.id_store);
  const { data: affiliate, isLoading: affiliateLoading } = useAffiliateQuery(client?.id_affiliate);
  
  console.log('📊 ClientDetail: Estado de datos:', {
    id,
    client: client ? 'loaded' : 'not loaded',
    isClientLoading,
    clientError: clientError?.message
  });

  const isLoading = isClientLoading;

  // Hooks de mutación
  const updateClientMutation = useUpdateClientMutation({
    onSuccess: (updatedClient) => {
      console.log('✅ ClientDetail: Cliente actualizado exitosamente:', updatedClient);
    },
    onError: (error) => {
      console.error('❌ ClientDetail: Error al actualizar cliente:', error);
      alert('Error al actualizar el cliente: ' + error.message);
    }
  });

  const deleteClientMutation = useDeleteClientMutation({
    onSuccess: (result, deletedId) => {
      if (String(deletedId) === String(id)) {
        navigate('/clients');
      }
    },
    onError: (error) => {
      alert('Error al eliminar el cliente: ' + error.message);
    }
  });

  // Detectar si venimos de la página de edición y refetch si es necesario
  useEffect(() => {
    const hasRecentEdit = sessionStorage.getItem('client_just_edited');
    if (hasRecentEdit === id) {
      console.log('🔄 ClientDetail: Refetch forzado después de edición');
      refetchClient();
      sessionStorage.removeItem('client_just_edited');
    }
  }, [id, refetchClient]);

  // Manejador para eliminar cliente
  const handleDelete = async (entity) => {
    console.log('🗑️ Eliminando cliente:', entity.id);
    return deleteClientMutation.mutateAsync(entity.id);
  };

  // Custom handlers
  const customHandlers = {
    onEdit: () => {
      if (!canEdit) {
        console.warn('🚫 Usuario no tiene permisos para editar clientes');
        alert('No tienes permisos para editar clientes');
        return false;
      }
      // Navegar a la página de edición
      navigate(`/clients/${id}/edit`);
      return false; // No abrir el drawer
    },
    onDelete: (entity) => {
      if (!canDelete) {
        console.warn('🚫 Usuario no tiene permisos para eliminar clientes');
        alert('No tienes permisos para eliminar clientes');
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
          {entity.active ? "Activo" : "Inactivo"}
        </Badge>
        {entity.newsletter && (
          <Badge
            variant="default"
            size="small"
            className="txt-compact-xsmall-plus bg-ui-tag-blue-bg text-ui-tag-blue-text border-ui-tag-blue-border"
          >
            📧 Newsletter
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
        <p className="font-medium font-sans txt-compact-small">Email</p>
        <p className="font-normal font-sans txt-compact-small">{entity.email || "-"}</p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Teléfono</p>
        <p className="font-normal font-sans txt-compact-small">{entity.phone || "-"}</p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Ciudad</p>
        <p className="font-normal font-sans txt-compact-small">{entity.city || "-"}</p>
      </div>
      
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Tienda</p>
        <p className="font-normal font-sans txt-compact-small">
          {storeLoading ? "Cargando..." : store?.name || store?.short_name || (entity.id_store ? `ID: ${entity.id_store}` : "-")}
        </p>
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
            <p className="font-sans txt-compact-small font-medium">Email</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">{entity.email || "-"}</p>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Teléfono</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">{entity.phone || "-"}</p>
          </div>
        </div>
      </div>

      {/* Asignaciones */}
      <div className="flex flex-col gap-y-4">
        <h3 className="font-sans font-medium txt-compact-medium-plus">Asignaciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Tienda Asignada</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">
              {storeLoading ? (
                <span className="text-ui-fg-muted">Cargando...</span>
              ) : store ? (
                <span className="font-medium text-ui-fg-base">{store.name || store.short_name || `Tienda ${store.id}`}</span>
              ) : entity.id_store ? (
                <span className="text-ui-fg-error">Error al cargar tienda (ID: {entity.id_store})</span>
              ) : (
                <span className="text-ui-fg-muted">Sin tienda asignada</span>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Afiliado</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">
              {affiliateLoading ? (
                <span className="text-ui-fg-muted">Cargando...</span>
              ) : affiliate ? (
                <span className="font-medium text-ui-fg-base">{affiliate.name || `Afiliado ${affiliate.id}`}</span>
              ) : entity.id_affiliate ? (
                <span className="text-ui-fg-error">Error al cargar afiliado (ID: {entity.id_affiliate})</span>
              ) : (
                <span className="text-ui-fg-muted">Sin afiliado asignado</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Información de Empresa */}
      {(entity.company || entity.tax_id) && (
        <div className="flex flex-col gap-y-4">
          <h3 className="font-sans font-medium txt-compact-medium-plus">Información de Empresa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-y-1">
              <p className="font-sans txt-compact-small font-medium">Empresa</p>
              <p className="font-sans txt-compact-small text-ui-fg-subtle">{entity.company || "-"}</p>
            </div>
            <div className="flex flex-col gap-y-1">
              <p className="font-sans txt-compact-small font-medium">CIF/NIF</p>
              <p className="font-sans txt-compact-small text-ui-fg-subtle">{entity.tax_id || "-"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dirección */}
      <div className="flex flex-col gap-y-4">
        <h3 className="font-sans font-medium txt-compact-medium-plus">Dirección</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Dirección</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">{entity.address || "-"}</p>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Ciudad</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">{entity.city || "-"}</p>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Código Postal</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">{entity.postal_code || "-"}</p>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">País</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">{entity.country || "-"}</p>
          </div>
        </div>
      </div>

      {/* Estado y Configuración */}
      <div className="flex flex-col gap-y-4">
        <h3 className="font-sans font-medium txt-compact-medium-plus">Estado y Configuración</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Estado</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                entity.active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {entity.active ? "Activo" : "Inactivo"}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Newsletter</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                entity.newsletter
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {entity.newsletter ? "Suscrito" : "No suscrito"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Notas */}
      {entity.notes && (
        <div className="flex flex-col gap-y-4">
          <h3 className="font-sans font-medium txt-compact-medium-plus">Notas</h3>
          <div className="bg-ui-bg-subtle rounded-lg p-4">
            <p className="font-sans txt-compact-small text-ui-fg-subtle whitespace-pre-wrap">
              {entity.notes}
            </p>
          </div>
        </div>
      )}

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
        <div className="text-ui-fg-subtle">Cargando datos del cliente...</div>
      </div>
    );
  }

  // Mostrar error
  if (clientError) {
    console.error('❌ ClientDetail: Error al cargar cliente:', clientError);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-ui-fg-on-color-bg">Error al cargar el cliente</div>
        <div className="text-ui-fg-subtle text-center">
          {clientError.message || "Ocurrió un error inesperado"}
        </div>
        <button 
          onClick={() => navigate('/clients')}
          className="px-4 py-2 bg-ui-bg-base border border-ui-border-base rounded-md hover:bg-ui-bg-subtle"
        >
          Volver a Clientes
        </button>
      </div>
    );
  }

  // Mostrar "no encontrado" si no hay datos
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-ui-fg-on-color-bg">Cliente no encontrado</div>
        <div className="text-ui-fg-subtle text-center">
          No se encontró un cliente con el ID: {id}
        </div>
        <button 
          onClick={() => navigate('/clients')}
          className="px-4 py-2 bg-ui-bg-base border border-ui-border-base rounded-md hover:bg-ui-bg-subtle"
        >
          Volver a Clientes
        </button>
      </div>
    );
  }

  return (
    <DataLayout
      entity={client}
      entityName="clients"
      entityPluralName="clientes"
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