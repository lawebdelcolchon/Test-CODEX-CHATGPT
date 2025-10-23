// src/layouts/DataLayout.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, DropdownMenu, Badge, Drawer, Input } from "@medusajs/ui";
import { EllipsisHorizontal, PencilSquare, ArrowLeft, XMarkMini } from "@medusajs/icons";
import DeleteConfirmModal from "../components/DeleteConfirmModal.jsx";

export default function DataLayout({
  // Data props
  entityName,
  entityPluralName,
  data,
  entity,
  
  // Form props
  formData,
  setFormData,
  onInputChange,
  onFormSubmit,
  
  // Content render props
  renderHeader,
  renderMainSections,
  renderSidebar,
  renderEditForm,
  
  // Config props
  deleteVerificationField = "name", // field to verify for deletion
  editTitle = "Editar",
  deleteItemText = "elemento",
  
  // Optional custom handlers
  customHandlers = {}
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Detectar si se debe abrir el drawer de edición o modal de eliminación desde URL
  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditDrawerOpen(true);
      // Limpiar el parámetro de la URL
      setSearchParams({});
    }
    if (searchParams.get('delete') === 'true') {
      setIsDeleteModalOpen(true);
      // Limpiar el parámetro de la URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);
  

  const handleEdit = () => {
    if (customHandlers.onEdit) {
      const result = customHandlers.onEdit();
      // Si el customHandler devuelve false, no abrir el drawer
      if (result === false) {
        return;
      }
    }
    setIsEditDrawerOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleBack = () => {
    // Intentar recuperar el estado de paginación guardado
    const savedListState = sessionStorage.getItem(`${entityName}_list_state`);
    
    if (savedListState) {
      try {
        const { page, pageSize, search, sort, order } = JSON.parse(savedListState);
        console.log(`🔙 DataLayout: Navegando de vuelta a ${entityName} con estado:`, { page, pageSize, search, sort, order });
        
        // Construir la URL con los parámetros de estado
        const params = new URLSearchParams();
        if (page && page !== 1) params.set('page', page.toString());
        if (pageSize && pageSize !== 10) params.set('pageSize', pageSize.toString());
        if (search) params.set('search', search);
        if (sort) params.set('sort', sort);
        if (order) params.set('order', order);
        
        const queryString = params.toString();
        const targetUrl = `/${entityName}${queryString ? `?${queryString}` : ''}`;
        console.log(`🎯 DataLayout: Navegando a:`, targetUrl);
        
        navigate(targetUrl);
        
        // Limpiar el estado después de usarlo
        setTimeout(() => {
          sessionStorage.removeItem(`${entityName}_list_state`);
        }, 100);
      } catch (error) {
        console.warn('Error parsing saved list state:', error);
        navigate(`/${entityName}`);
      }
    } else {
      navigate(`/${entityName}`);
    }
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    console.log(`🔄 DataLayout.handleEditSubmit INICIO - ${entityName}:`, formData);
    
    if (onFormSubmit) {
      try {
        console.log('🗣️ DataLayout.handleEditSubmit - Llamando a onFormSubmit...');
        const result = await onFormSubmit(formData);
        console.log('✅ DataLayout.handleEditSubmit - onFormSubmit ÉXITO:', result);
        setIsEditDrawerOpen(false);
      } catch (error) {
        console.error('❌ DataLayout.handleEditSubmit - onFormSubmit ERROR:', error);
        console.error('❌ DataLayout.handleEditSubmit - Manteniendo drawer abierto debido al error');
        // No cerrar el drawer si hay error
        // setIsEditDrawerOpen(false); // Comentado para mantener abierto
      }
    } else {
      console.warn('⚠️ DataLayout.handleEditSubmit - No onFormSubmit provided');
      setIsEditDrawerOpen(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditDrawerOpen(false);
  };
  
  // Funciones para el modal de eliminación
  const handleDeleteConfirm = async () => {
    console.log(`Deleting ${entityName}:`, entity.id);
    try {
      if (customHandlers.onDelete) {
        await customHandlers.onDelete(entity);
      }
      setIsDeleteModalOpen(false);
      // Solo navegar si no hubo errores - usar handleBack para preservar estado
      handleBack();
    } catch (error) {
      console.error('Error during delete:', error);
      // Mantener el modal abierto si hay error
      // El error ya se maneja en el customHandler
    }
  };
  
  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const ActionsMenu = () => (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="transparent" size="small">
          <EllipsisHorizontal />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item onClick={handleEdit}>
          <PencilSquare className="mr-2" />
          Editar
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={handleDelete} className="text-ui-fg-error">
          Eliminar {deleteItemText}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );

  const EmptyState = ({ title, description }) => (
    <div className="flex h-[150px] w-full flex-col items-center justify-center gap-y-4">
      <div className="flex flex-col items-center gap-y-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" className="text-ui-fg-subtle">
          <g stroke="currentColor" clipPath="url(#a)">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7.5 13.944a6.444 6.444 0 1 0 0-12.888 6.444 6.444 0 0 0 0 12.888M7.5 4.328v3.678" />
            <path strokeWidth="0.9" d="M7.5 10.099a.44.44 0 0 1 .44.438.44.44 0 0 1-.44.44.44.44 0 0 1 0-.878Z" />
          </g>
          <defs>
            <clipPath id="a">
              <path fill="#fff" d="M0 0h15v15H0z" />
            </clipPath>
          </defs>
        </svg>
        <div className="flex flex-col items-center gap-y-1">
          <p className="font-medium font-sans txt-compact-small">{title}</p>
          <p className="font-normal font-sans txt-small text-ui-fg-muted">{description}</p>
        </div>
      </div>
    </div>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex w-full flex-col gap-y-3">
      {/* Back Button */}
      <div className="flex items-center gap-x-2">
        <Button
          variant="transparent"
          size="small"
          onClick={handleBack}
          className="h-8 w-8 p-1"
        >
          <ArrowLeft />
        </Button>
        <span className="text-ui-fg-muted txt-small">Volver a {entityPluralName}</span>
      </div>
      
      <div className="flex w-full flex-col items-start gap-x-4 gap-y-3 xl:grid xl:grid-cols-[minmax(0,_1fr)_440px]">
        {/* Main Content */}
        <div className="flex w-full min-w-0 flex-col gap-y-3">
          {/* Entity Header */}
          <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
              {renderHeader({ entity, ActionsMenu })}
            </div>
            {renderHeader.additionalRows && renderHeader.additionalRows({ entity })}
          </div>

          {/* Main Sections */}
          {renderMainSections({ EmptyState, entity, Link, Button })}
        </div>

        {/* Sidebar - Desktop Only */}
        <div className="hidden flex-col gap-y-3 xl:flex">
          {renderSidebar({ entity, Link, Button, Badge, PencilSquare })}
        </div>

        {/* Mobile Sidebar */}
        <div className="flex flex-col gap-y-3 xl:hidden">
          {renderSidebar({ entity, Link, Button, Badge, PencilSquare, mobile: true })}
        </div>
      </div>
      
      {/* Edit Drawer */}
      <Drawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
        <Drawer.Title className="sr-only">{editTitle}</Drawer.Title>
        <Drawer.Description className="sr-only">
          Formulario para editar la {deleteItemText.toLowerCase()}
        </Drawer.Description>
        <Drawer.Content className="bg-ui-bg-base shadow-elevation-modal border-ui-border-base fixed inset-y-2 flex w-full flex-1 flex-col rounded-lg border outline-none max-sm:inset-x-2 max-sm:w-[calc(100%-16px)] sm:right-2 sm:max-w-[560px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-1/2 data-[state=open]:slide-in-from-right-1/2 duration-200">
          <form className="flex flex-1 flex-col" onSubmit={handleEditSubmit}>
            {/* Header */}
            <div className="border-ui-border-base flex items-center justify-between border-b px-6 py-4">
              <div className="flex flex-col gap-y-1">
                <h1 className="font-sans font-medium h1-core">{editTitle}</h1>
              </div>
              <div className="flex items-center gap-x-2">
                <kbd className="bg-ui-tag-neutral-bg text-ui-tag-neutral-text border-ui-tag-neutral-border inline-flex h-5 w-fit min-w-[20px] items-center justify-center rounded-md border px-1 txt-compact-xsmall-plus">
                  esc
                </kbd>
                <Button 
                  type="button" 
                  variant="transparent" 
                  size="small" 
                  onClick={handleEditCancel}
                  className="h-7 w-7 p-1"
                >
                  <XMarkMini />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-4">
              {renderEditForm && renderEditForm({ formData, onInputChange, entity })}
            </div>

            {/* Footer */}
            <div className="border-ui-border-base flex items-center justify-end gap-x-2 border-t p-4">
              <Button 
                type="button" 
                variant="secondary" 
                size="small"
                onClick={handleEditCancel}
                className="txt-compact-small-plus gap-x-1.5 px-2 py-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                variant="primary" 
                size="small"
                className="shadow-buttons-inverted text-ui-contrast-fg-primary bg-ui-button-inverted txt-compact-small-plus gap-x-1.5 px-2 py-1"
              >
                Actualizar
              </Button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer>
      
      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        entityName={deleteItemText}
        entityValue={entity?.[deleteVerificationField]}
        verificationField={deleteVerificationField}
      />
    </div>
  );
}
