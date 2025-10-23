// src/features/suppliers/index.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input, Badge, Button, Select, Textarea, Switch } from "@medusajs/ui";
import DataLayout from "../../layouts/DataLayout.jsx";
import { hasPermission } from "../../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useSupplierQuery,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useUpdateSupplierStatusMutation
} from "../../hooks/queries/useSuppliers.js";
import { formatDate } from "../../utils/formatters.js";

export default function SupplierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canEdit = hasPermission(user, ['all', 'suppliers']);
  const canDelete = hasPermission(user, ['all', 'suppliers']);

  const {
    data: supplier,
    isLoading: isSupplierLoading,
    error: supplierError,
    refetch: refetchSupplier
  } = useSupplierQuery(id);

  // Hooks de mutación
  const updateSupplierMutation = useUpdateSupplierMutation({
    onSuccess: (updatedSupplier) => {
      console.log('✅ SupplierDetail: Supplier actualizado exitosamente:', updatedSupplier);
    },
    onError: (error) => {
      console.error('❌ SupplierDetail: Error al actualizar supplier:', error);
      alert('Error al actualizar el proveedor: ' + error.message);
    }
  });

  const deleteSupplierMutation = useDeleteSupplierMutation({
    onSuccess: (result, deletedId) => {
      if (String(deletedId) === String(id)) {
        navigate('/suppliers');
      }
    },
    onError: (error) => {
      alert('Error al eliminar el proveedor: ' + error.message);
    }
  });

  const updateStatusMutation = useUpdateSupplierStatusMutation();

  // Detectar si venimos de la página de edición y refetch si es necesario
  useEffect(() => {
    const hasRecentEdit = sessionStorage.getItem('supplier_just_edited');
    if (hasRecentEdit === id) {
      console.log('🔄 SupplierDetail: Refetch forzado después de edición');
      refetchSupplier();
      sessionStorage.removeItem('supplier_just_edited');
    }
  }, [id, refetchSupplier]);

  // Manejador para eliminar supplier
  const handleDelete = async (entity) => {
    console.log('🗑️ Eliminando supplier:', entity.id);
    return deleteSupplierMutation.mutateAsync(entity.id);
  };

  // Custom handlers
  const customHandlers = {
    onEdit: () => {
      if (!canEdit) {
        console.warn('🚫 Usuario no tiene permisos para editar suppliers');
        alert('No tienes permisos para editar proveedores');
        return false;
      }
      // Navegar a la página de edición
      navigate(`/suppliers/${id}/edit`);
      return false; // No abrir el drawer
    },
    onDelete: (entity) => {
      if (!canDelete) {
        console.warn('🚫 Usuario no tiene permisos para eliminar suppliers');
        alert('No tienes permisos para eliminar proveedores');
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
        {entity.is_company && (
          <Badge
            variant="default"
            size="small"
            className="txt-compact-xsmall-plus bg-ui-tag-blue-bg text-ui-tag-blue-text border-ui-tag-blue-border"
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
        <p className="font-medium font-sans txt-compact-small">Código Fiscal</p>
        <p className="font-normal font-sans txt-compact-small">{entity.tax_code || "-"}</p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Email</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.email ? (
            <a 
              href={`mailto:${entity.email}`}
              className="text-ui-tag-blue-text hover:text-ui-tag-blue-text-hover underline"
            >
              {entity.email}
            </a>
          ) : "-"}
        </p>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Teléfono</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.phone ? (
            <a 
              href={`tel:${entity.phone}`}
              className="text-ui-tag-blue-text hover:text-ui-tag-blue-text-hover underline"
            >
              {entity.phone}
            </a>
          ) : "-"}
        </p>
      </div>
    </>
  );

  const renderMainSections = ({ EmptyState, entity, Link, Button }) => (
    <>
      {/* Contact Information Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Información de Contacto</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Email</p>
              <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
                {entity.email ? (
                  <a 
                    href={`mailto:${entity.email}`}
                    className="text-ui-tag-blue-text hover:text-ui-tag-blue-text-hover underline"
                  >
                    {entity.email}
                  </a>
                ) : "Sin email"}
              </p>
            </div>
            <div>
              <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Teléfono</p>
              <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
                {entity.phone ? (
                  <a 
                    href={`tel:${entity.phone}`}
                    className="text-ui-tag-blue-text hover:text-ui-tag-blue-text-hover underline"
                  >
                    {entity.phone}
                  </a>
                ) : "Sin teléfono"}
              </p>
            </div>
            {entity.fax && (
              <div>
                <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Fax</p>
                <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
                  {entity.fax}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Dirección</h2>
        </div>
        <div className="px-6 py-4">
          {entity.address || entity.city || entity.zipcode ? (
            <div className="space-y-2">
              {entity.address && (
                <p className="font-normal font-sans txt-compact-small text-ui-fg-base">{entity.address}</p>
              )}
              <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
                {entity.zipcode && `${entity.zipcode} `}
                {entity.city && entity.city}
              </p>
            </div>
          ) : (
            <EmptyState
              title="Sin dirección"
              description="Este proveedor no tiene información de dirección."
            />
          )}
        </div>
      </div>

      {/* Shipping Codes Section */}
      {(entity.code_shipping || entity.code_control) && (
        <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="font-sans font-medium h2-core">Códigos de Envío</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            {entity.code_shipping && (
              <div>
                <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Código de Envío</p>
                <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle font-mono">
                  {entity.code_shipping}
                </p>
              </div>
            )}
            {entity.code_control && (
              <div>
                <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Código de Control</p>
                <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle font-mono">
                  {entity.code_control}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
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
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Estado del proveedor</p>
            <Badge variant={entity.active ? "default" : "secondary"} size="small">
              {entity.active ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Tipo</p>
            <Badge variant={entity.is_company ? "default" : "secondary"} size="small">
              {entity.is_company ? "Empresa" : "Persona"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tax Information Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Información Fiscal</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Código Fiscal</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle font-mono">
              {entity.tax_code || "Sin código"}
            </p>
          </div>
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Tipo de Entidad</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
              {entity.is_company ? "Empresa" : "Persona física"}
            </p>
          </div>
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
  console.log('🔍 SupplierDetail - Debug datos:', {
    id,
    isLoading: isSupplierLoading,
    supplier,
    supplierError
  });

  // Mostrar loading
  if (isSupplierLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-2 text-ui-fg-muted">Cargando proveedor...</p>
          <p className="mt-1 text-xs text-ui-fg-muted">ID: {id}</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no hay supplier
  if (!supplier && !isSupplierLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Proveedor no encontrado</h2>
          <p className="text-gray-500 mb-4">No se pudo cargar el proveedor con ID: {id}</p>
          {supplierError && (
            <p className="text-sm text-red-600">Error: {supplierError.message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <DataLayout
      entityName="suppliers"
      entityPluralName="Proveedores"
      entity={supplier}
      renderHeader={renderHeader}
      renderMainSections={renderMainSections}
      renderSidebar={renderSidebar}
      deleteVerificationField="name"
      deleteItemText="proveedor"
      customHandlers={customHandlers}
    />
  );
}