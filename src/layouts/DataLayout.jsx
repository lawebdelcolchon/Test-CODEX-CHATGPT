// src/layouts/DataLayout.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, DropdownMenu, Badge, Drawer, Input } from "@medusajs/ui";
import { EllipsisHorizontal, PencilSquare, ArrowLeft, XMarkMini } from "@medusajs/icons";

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
  const [verificationText, setVerificationText] = useState("");
  
  // Detectar si se debe abrir el drawer de edición o modal de eliminación desde URL
  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditDrawerOpen(true);
      // Limpiar el parámetro de la URL
      setSearchParams({});
    }
    if (searchParams.get('delete') === 'true') {
      setIsDeleteModalOpen(true);
      setVerificationText(""); // Limpiar texto de verificación
      // Limpiar el parámetro de la URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);
  
  // Manejar tecla ESC para cerrar el modal de eliminación
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isDeleteModalOpen) {
        handleDeleteCancel();
      }
    };
    
    if (isDeleteModalOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDeleteModalOpen]);

  const handleEdit = () => {
    if (customHandlers.onEdit) {
      customHandlers.onEdit();
    }
    setIsEditDrawerOpen(true);
  };

  const handleDelete = () => {
    setVerificationText("");
    setIsDeleteModalOpen(true);
  };

  const handleBack = () => {
    navigate(`/${entityName}`);
  };
  
  const handleEditSubmit = (e) => {
    e.preventDefault();
    console.log(`Updating ${entityName}:`, formData);
    if (onFormSubmit) {
      onFormSubmit(formData);
    }
    setIsEditDrawerOpen(false);
  };

  const handleEditCancel = () => {
    setIsEditDrawerOpen(false);
  };
  
  // Funciones para el modal de eliminación
  const handleVerificationChange = (e) => {
    setVerificationText(e.target.value);
  };
  
  const isDeleteEnabled = verificationText === entity?.[deleteVerificationField];
  
  const handleDeleteSubmit = (e) => {
    e.preventDefault();
    if (!isDeleteEnabled) return;
    
    console.log(`Deleting ${entityName}:`, entity.id);
    if (customHandlers.onDelete) {
      customHandlers.onDelete(entity);
    }
    setIsDeleteModalOpen(false);
    setVerificationText("");
    navigate(`/${entityName}`);
  };
  
  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setVerificationText("");
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
              {renderEditForm({ formData, onInputChange, entity })}
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
      
      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleDeleteCancel}
        >
          <div 
            className="bg-ui-bg-base shadow-elevation-modal border-ui-border-base w-full max-w-md rounded-lg border outline-none m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleDeleteSubmit}>
              {/* Header */}
              <div className="flex flex-col gap-y-1 px-6 pt-6">
                <h2 className="font-sans font-medium h2-core text-ui-fg-base">
                  Eliminar {deleteItemText}
                </h2>
                <p className="text-ui-fg-subtle txt-compact-medium">
                  Estás a punto de eliminar {deleteItemText.toLowerCase()} "{entity?.[deleteVerificationField]}". Esta acción no puede deshacerse.
                </p>
              </div>
              
              {/* Verification Section */}
              <div className="border-ui-border-base mt-6 flex flex-col gap-y-4 border-y p-6">
                <label 
                  className="font-sans txt-compact-medium font-normal text-ui-fg-subtle" 
                  htmlFor="verificationText"
                >
                  Por favor escribe{" "}
                  <span className="text-ui-fg-base txt-compact-medium-plus">
                    {entity?.[deleteVerificationField]}
                  </span>{" "}
                  para confirmar:
                </label>
                <div className="relative">
                  <Input
                    id="verificationText"
                    name="verificationText"
                    type="text"
                    value={verificationText}
                    onChange={handleVerificationChange}
                    className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
                    placeholder={entity?.[deleteVerificationField]}
                    autoComplete="off"
                  />
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-end gap-x-2 p-6">
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="small"
                  onClick={handleDeleteCancel}
                  className="txt-compact-small-plus gap-x-1.5 px-2 py-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  variant="danger"
                  size="small"
                  disabled={!isDeleteEnabled}
                  className="shadow-buttons-danger bg-ui-button-danger hover:bg-ui-button-danger-hover active:bg-ui-button-danger-pressed focus-visible:shadow-buttons-danger-focus txt-compact-small-plus gap-x-1.5 px-2 py-1"
                >
                  Eliminar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
