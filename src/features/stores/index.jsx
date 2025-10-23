// src/features/stores/index.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@medusajs/ui";
import DataLayout from "../../layouts/DataLayout.jsx";
import { hasPermission } from "../../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useStoreQuery,
  useUpdateStoreMutation,
  useDeleteStoreMutation
} from "../../hooks/queries/useStores.js";
import { formatDate } from "../../utils/formatters.js";

export default function StoreDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canEdit = hasPermission(user, ['all', 'stores']);
  const canDelete = hasPermission(user, ['all', 'stores']);

  // Usar TanStack Query para obtener datos
  const {
    data: store,
    isLoading: isStoreLoading,
    error: storeError,
    refetch: refetchStore
  } = useStoreQuery(id);
  
  console.log('📊 StoreDetail: Estado de datos:', {
    id,
    store: store ? 'loaded' : 'not loaded',
    isStoreLoading,
    storeError: storeError?.message
  });

  const isLoading = isStoreLoading;

  // Hooks de mutación
  const updateStoreMutation = useUpdateStoreMutation({
    onSuccess: (updatedStore) => {
      console.log('✅ StoreDetail: Tienda actualizada exitosamente:', updatedStore);
    },
    onError: (error) => {
      console.error('❌ StoreDetail: Error al actualizar tienda:', error);
      alert('Error al actualizar la tienda: ' + error.message);
    }
  });

  const deleteStoreMutation = useDeleteStoreMutation({
    onSuccess: (result, deletedId) => {
      if (String(deletedId) === String(id)) {
        navigate('/stores');
      }
    },
    onError: (error) => {
      alert('Error al eliminar la tienda: ' + error.message);
    }
  });

  // Detectar si venimos de la página de edición y refetch si es necesario
  useEffect(() => {
    const hasRecentEdit = sessionStorage.getItem('store_just_edited');
    if (hasRecentEdit === id) {
      console.log('🔄 StoreDetail: Refetch forzado después de edición');
      refetchStore();
      sessionStorage.removeItem('store_just_edited');
    }
  }, [id, refetchStore]);

  // Manejador para eliminar tienda
  const handleDelete = async (entity) => {
    console.log('🗑️ Eliminando tienda:', entity.id);
    return deleteStoreMutation.mutateAsync(entity.id);
  };

  // Custom handlers
  const customHandlers = {
    onEdit: () => {
      if (!canEdit) {
        console.warn('🚫 Usuario no tiene permisos para editar tiendas');
        alert('No tienes permisos para editar tiendas');
        return false;
      }
      // Navegar a la página de edición
      navigate(`/stores/${id}/edit`);
      return false; // No abrir el drawer
    },
    onDelete: (entity) => {
      if (!canDelete) {
        console.warn('🚫 Usuario no tiene permisos para eliminar tiendas');
        alert('No tienes permisos para eliminar tiendas');
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
        {entity.is_company && (
          <Badge
            variant="default"
            size="small"
            className="txt-compact-xsmall-plus bg-ui-tag-purple-bg text-ui-tag-purple-text border-ui-tag-purple-border"
          >
            🏢 Empresa
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
        <p className="font-medium font-sans txt-compact-small">Nombre Corto</p>
        <p className="font-normal font-sans txt-compact-small">{entity.short_name || "-"}</p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Código Fiscal</p>
        <p className="font-normal font-sans txt-compact-small">{entity.tax_code || "-"}</p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Teléfono</p>
        <p className="font-normal font-sans txt-compact-small">{entity.phone || "-"}</p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Email</p>
        <p className="font-normal font-sans txt-compact-small">{entity.email || "-"}</p>
      </div>
    </>
  );

  const renderDetails = ({ entity }) => (
    <div className="flex flex-col gap-y-6">
      {/* Información de Contacto */}
      <div className="flex flex-col gap-y-4">
        <h3 className="font-sans font-medium txt-compact-medium-plus">Información de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Teléfono</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">{entity.phone || "-"}</p>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Email</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">{entity.email || "-"}</p>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Fax</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">{entity.fax || "-"}</p>
          </div>
        </div>
      </div>

      {/* Dirección */}
      <div className="flex flex-col gap-y-4">
        <h3 className="font-sans font-medium txt-compact-medium-plus">Dirección</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <p className="font-sans txt-compact-small text-ui-fg-subtle">{entity.zipcode || "-"}</p>
          </div>
        </div>
      </div>

      {/* Códigos de Control */}
      <div className="flex flex-col gap-y-4">
        <h3 className="font-sans font-medium txt-compact-medium-plus">Códigos de Control</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Código Fiscal</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">{entity.tax_code || "-"}</p>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Código de Envío</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">{entity.code_shipping || "-"}</p>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Código de Control</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">{entity.code_control || "-"}</p>
          </div>
        </div>
      </div>

      {/* Configuración */}
      <div className="flex flex-col gap-y-4">
        <h3 className="font-sans font-medium txt-compact-medium-plus">Configuración</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Tipo</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">
              {entity.is_company ? "Empresa" : "Individual"}
            </p>
          </div>
          <div className="flex flex-col gap-y-1">
            <p className="font-sans txt-compact-small font-medium">Estado</p>
            <p className="font-sans txt-compact-small text-ui-fg-subtle">
              {entity.active ? "Activa" : "Inactiva"}
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
        <div className="text-ui-fg-subtle">Cargando datos de la tienda...</div>
      </div>
    );
  }

  // Mostrar error
  if (storeError) {
    console.error('❌ StoreDetail: Error al cargar tienda:', storeError);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-ui-fg-on-color-bg">Error al cargar la tienda</div>
        <div className="text-ui-fg-subtle text-center">
          {storeError.message || "Ocurrió un error inesperado"}
        </div>
        <button 
          onClick={() => navigate('/stores')}
          className="px-4 py-2 bg-ui-bg-base border border-ui-border-base rounded-md hover:bg-ui-bg-subtle"
        >
          Volver a Tiendas
        </button>
      </div>
    );
  }

  // Mostrar "no encontrado" si no hay datos
  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-ui-fg-on-color-bg">Tienda no encontrada</div>
        <div className="text-ui-fg-subtle text-center">
          No se encontró una tienda con el ID: {id}
        </div>
        <button 
          onClick={() => navigate('/stores')}
          className="px-4 py-2 bg-ui-bg-base border border-ui-border-base rounded-md hover:bg-ui-bg-subtle"
        >
          Volver a Tiendas
        </button>
      </div>
    );
  }

  return (
    <DataLayout
      entity={store}
      entityName="stores"
      entityPluralName="tiendas"
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