// src/features/marketplace/index.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input, Badge, Button, Select, Textarea, Switch } from "@medusajs/ui";
import DataLayout from "../../layouts/DataLayout.jsx";
import { hasPermission } from "../../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useMarketplaceQuery,
  useUpdateMarketplaceMutation,
  useDeleteMarketplaceMutation,
  useUpdateMarketplaceStatusMutation,
  useUpdateMarketplaceVisibilityMutation
} from "../../hooks/queries/useMarketplace.js";
import { formatDate } from "../../utils/formatters.js";

export default function MarketplaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canEdit = hasPermission(user, ['all', 'marketplace']);
  const canDelete = hasPermission(user, ['all', 'marketplace']);

  const {
    data: marketplace,
    isLoading: isMarketplaceLoading,
    error: marketplaceError,
    refetch: refetchMarketplace
  } = useMarketplaceQuery(id);

  // Hooks de mutación
  const updateMarketplaceMutation = useUpdateMarketplaceMutation({
    onSuccess: (updatedMarketplace) => {
      console.log('✅ MarketplaceDetail: Marketplace actualizado exitosamente:', updatedMarketplace);
    },
    onError: (error) => {
      console.error('❌ MarketplaceDetail: Error al actualizar marketplace:', error);
      alert('Error al actualizar el marketplace: ' + error.message);
    }
  });

  const deleteMarketplaceMutation = useDeleteMarketplaceMutation({
    onSuccess: (result, deletedId) => {
      if (String(deletedId) === String(id)) {
        navigate('/marketplace');
      }
    },
    onError: (error) => {
      alert('Error al eliminar el marketplace: ' + error.message);
    }
  });

  const updateStatusMutation = useUpdateMarketplaceStatusMutation();
  const updateVisibilityMutation = useUpdateMarketplaceVisibilityMutation();

  // Detectar si venimos de la página de edición y refetch si es necesario
  useEffect(() => {
    const hasRecentEdit = sessionStorage.getItem('marketplace_just_edited');
    if (hasRecentEdit === id) {
      console.log('🔄 MarketplaceDetail: Refetch forzado después de edición');
      refetchMarketplace();
      sessionStorage.removeItem('marketplace_just_edited');
    }
  }, [id, refetchMarketplace]);

  // Manejador para eliminar marketplace
  const handleDelete = async (entity) => {
    console.log('🗑️ Eliminando marketplace:', entity.id);
    return deleteMarketplaceMutation.mutateAsync(entity.id);
  };

  // Custom handlers
  const customHandlers = {
    onEdit: () => {
      if (!canEdit) {
        console.warn('🚫 Usuario no tiene permisos para editar marketplaces');
        alert('No tienes permisos para editar marketplaces');
        return false;
      }
      // Navegar a la página de edición
      navigate(`/marketplace/${id}/edit`);
      return false; // No abrir el drawer
    },
    onDelete: (entity) => {
      if (!canDelete) {
        console.warn('🚫 Usuario no tiene permisos para eliminar marketplaces');
        alert('No tienes permisos para eliminar marketplaces');
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
        {entity.visible && (
          <Badge
            variant="default"
            size="small"
            className="txt-compact-xsmall-plus bg-ui-tag-green-bg text-ui-tag-green-text border-ui-tag-green-border"
          >
            👁 Visible
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
        <p className="font-medium font-sans txt-compact-small">Código</p>
        <p className="font-normal font-sans txt-compact-small">{entity.code || "-"}</p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">URL</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.url ? (
            <a 
              href={entity.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-ui-tag-blue-text hover:text-ui-tag-blue-text-hover underline"
            >
              {entity.url}
            </a>
          ) : "-"}
        </p>
      </div>
    </>
  );

  const renderMainSections = ({ EmptyState, entity, Link, Button }) => (
    <>
      {/* Description Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Descripción</h2>
        </div>
        <div className="px-6 py-4">
          {entity.description ? (
            <div className="prose max-w-none text-ui-fg-base">
              <p>{entity.description}</p>
            </div>
          ) : (
            <EmptyState
              title="Sin descripción"
              description="Este marketplace no tiene una descripción detallada."
            />
          )}
        </div>
      </div>

      {/* URL Information Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Información de Acceso</h2>
        </div>
        <div className="px-6 py-4">
          {entity.url ? (
            <div className="space-y-4">
              <div>
                <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-2">URL del Marketplace</p>
                <a 
                  href={entity.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-ui-bg-subtle text-ui-fg-base rounded-md hover:bg-ui-bg-subtle-hover transition-colors"
                >
                  <span>{entity.url}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Sin URL configurada"
              description="Este marketplace no tiene una URL configurada."
            />
          )}
        </div>
      </div>
    </>
  );

  const renderSidebar = ({ entity, Link, Button, Badge, PencilSquare, mobile = false }) => (
    <>
      {/* Status Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Estado</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Estado del marketplace</p>
            <Badge variant={entity.active ? "default" : "secondary"} size="small">
              {entity.active ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Visibilidad</p>
            <Badge variant={entity.visible ? "default" : "secondary"} size="small">
              {entity.visible ? "Visible" : "Oculto"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Información</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Código único</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle font-mono">
              {entity.code}
            </p>
          </div>
          {entity.url && (
            <div>
              <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Enlace</p>
              <div className="break-all">
                <a 
                  href={entity.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-normal font-sans txt-compact-small text-ui-tag-blue-text hover:text-ui-tag-blue-text-hover underline"
                >
                  {entity.url}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          <h2 className="font-sans font-medium h2-core">Fechas</h2>
        </div>
      </div>
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-0 -mt-3">
        <div className="px-6 py-4 space-y-3">
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Creado</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
              {formatDate(entity.created_at)}
            </p>
          </div>
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Actualizado</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
              {formatDate(entity.updated_at)}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  // Debug: mostrar datos en consola
  console.log('🔍 MarketplaceDetail - Debug datos:', {
    id,
    isLoading: isMarketplaceLoading,
    marketplace,
    marketplaceError
  });

  // Mostrar loading
  if (isMarketplaceLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-2 text-ui-fg-muted">Cargando marketplace...</p>
          <p className="mt-1 text-xs text-ui-fg-muted">ID: {id}</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no hay marketplace
  if (!marketplace && !isMarketplaceLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Marketplace no encontrado</h2>
          <p className="text-gray-500 mb-4">No se pudo cargar el marketplace con ID: {id}</p>
          {marketplaceError && (
            <p className="text-sm text-red-600">Error: {marketplaceError.message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <DataLayout
      entityName="marketplace"
      entityPluralName="Marketplaces"
      entity={marketplace}
      renderHeader={renderHeader}
      renderMainSections={renderMainSections}
      renderSidebar={renderSidebar}
      deleteVerificationField="name"
      deleteItemText="marketplace"
      customHandlers={customHandlers}
    />
  );
}