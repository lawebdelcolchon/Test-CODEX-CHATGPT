// src/features/options/index.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Input, Badge, Button, Select, Textarea, Switch } from "@medusajs/ui";
import DataLayout from "../../layouts/DataLayout.jsx";
import { hasPermission } from "../../utils/permissions.js";
import { useSelector } from "react-redux";
import { 
  useOptionsQuery,
  useOptionQuery,
  useUpdateOptionMutation, 
  useDeleteOptionMutation 
} from "../../hooks/queries/useOptions.js";

export default function OptionDetail() {
  const { id } = useParams();

  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canEdit = hasPermission(user, ['all', 'options']);
  const canDelete = hasPermission(user, ['all', 'options']);

  // Usar TanStack Query para obtener datos
  const { 
    data: optionsResult, 
    isLoading: isOptionsLoading 
  } = useOptionsQuery({ page: 1, pageSize: 100 });
  
  const { 
    data: option, 
    isLoading: isOptionLoading,
    error: optionError 
  } = useOptionQuery(id);

  // Extraer datos de opciones para el selector
  const optionsData = optionsResult?.items || [];
  const isLoading = isOptionsLoading || isOptionLoading;

  // Hooks de mutación
  const updateOptionMutation = useUpdateOptionMutation({
    onSuccess: (updatedOption) => {
      console.log('✅ OptionDetail: Opción actualizada exitosamente:', updatedOption);
    },
    onError: (error) => {
      console.error('❌ OptionDetail: Error detallado al actualizar opción:', error);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error response:', error.response?.data);
      alert('Error al actualizar la opción: ' + error.message);
    }
  });

  const deleteOptionMutation = useDeleteOptionMutation({
    onSuccess: (result, deletedId) => {
      // Si la opción eliminada era la que se estaba viendo, redirigir
      if (String(deletedId) === String(id)) {
        // Redirigir a la lista principal
        window.location.href = '/options';
      }
    },
    onError: (error) => {
      alert('Error al eliminar la opción: ' + error.message);
    }
  });
  
  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    name: option?.name || "",
    utilities: option?.utilities || "",
    caption: option?.caption || "",
    observations: option?.observations || "",
    id_category: option?.id_category || null,
    position: option?.position || 0,
    active: Boolean(option?.active)
  });
  
  // Update formData when option changes
  useEffect(() => {
    if (option) {
      setFormData({
        name: option?.name || "",
        utilities: option?.utilities || "",
        caption: option?.caption || "",
        observations: option?.observations || "",
        id_category: option?.id_category || null,
        position: option?.position || 0,
        active: Boolean(option?.active)
      });
    }
  }, [option]);
  
  // Input change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (name === 'position' || name === 'id_category') ? 
              (value === '' ? null : parseInt(value)) : value
    }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Custom handlers
  const customHandlers = {
    onEdit: () => {
      // Refresh formData when edit starts
      setFormData({
        name: option?.name || "",
        utilities: option?.utilities || "",
        caption: option?.caption || "",
        observations: option?.observations || "",
        id_category: option?.id_category || null,
        position: option?.position || 0,
        active: Boolean(option?.active)
      });
    },
    onDelete: (entity) => {
      // Handle delete logic here if needed
      console.log("Custom delete logic for option:", entity);
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
        <ActionsMenu />
      </div>
    </>
  );
  
  renderHeader.additionalRows = ({ entity }) => (
    <>
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">ID</p>
        <p className="font-normal font-sans txt-compact-small">
          #{entity.id}
        </p>
      </div>
      
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Utilidades</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.utilities || "-"}
        </p>
      </div>
      
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Posición</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.position || "0"}
        </p>
      </div>
      
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Caption</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.caption || "Sin caption"}
        </p>
      </div>
      
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">ID Categoría</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.id_category ? `#${entity.id_category}` : "Sin categoría"}
        </p>
      </div>
    </>
  );
  
  const renderMainSections = ({ EmptyState, entity, Link, Button }) => (
    <>
      {/* Values Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Valores de la Opción</h2>
          <Link to={`/option-values/create?option=${entity.id}`}>
            <Button variant="secondary" size="small" className="txt-compact-small-plus gap-x-1.5 px-2 py-1">
              Agregar valor
            </Button>
          </Link>
        </div>
        <EmptyState 
          title="No hay registros"
          description="Esta opción no tiene valores configurados."
        />
      </div>

      {/* Products Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Productos Relacionados</h2>
          <Link to={`/products?option=${entity.id}`}>
            <Button variant="secondary" size="small" className="txt-compact-small-plus gap-x-1.5 px-2 py-1">
              Ver productos
            </Button>
          </Link>
        </div>
        <EmptyState 
          title="No hay registros"
          description="Esta opción no está asignada a ningún producto."
        />
      </div>
    </>
  );
  
  const renderSidebar = ({ entity, Link, Button, Badge, PencilSquare, mobile = false }) => (
    <>
      {/* Observations Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Observaciones</h2>
          <Link to={`/options/${entity.id}/observations/edit`}>
            <Button variant="transparent" size="small" className="h-7 w-7 p-1 text-ui-fg-muted hover:text-ui-fg-subtle">
              <PencilSquare />
            </Button>
          </Link>
        </div>
        <div className="px-6 py-4">
          <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle whitespace-pre-line">
            {entity.observations || "Sin observaciones"}
          </p>
        </div>
      </div>
      
      {/* Configuration Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Configuración</h2>
          <Link to={`/options/${entity.id}/config/edit`}>
            <Button variant="transparent" size="small" className="h-7 w-7 p-1 text-ui-fg-muted hover:text-ui-fg-subtle">
              <PencilSquare />
            </Button>
          </Link>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Fecha de Creación</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
              {entity.created_at ? new Date(entity.created_at).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : "Fecha no disponible"}
            </p>
          </div>
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Última Actualización</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
              {entity.updated_at ? new Date(entity.updated_at).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : "Nunca actualizada"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Metadatos Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          <h2 className="font-sans font-medium h2-core">Metadatos</h2>
          <Badge 
            variant="secondary" 
            size="small"
            className="bg-ui-tag-neutral-bg text-ui-tag-neutral-text [&_svg]:text-ui-tag-neutral-icon border-ui-tag-neutral-border inline-flex items-center gap-x-0.5 border box-border txt-compact-xsmall-plus h-5 rounded-full px-1.5"
          >
            0 claves
          </Badge>
        </div>
        <Link to={`/options/${entity.id}/metadata/edit`}>
          <Button variant="transparent" size="small" className="h-7 w-7 p-1 text-ui-fg-muted hover:text-ui-fg-subtle">
            <PencilSquare />
          </Button>
        </Link>
      </div>
    </>
  );
  
  const renderEditForm = ({ formData, onInputChange, onSwitchChange }) => (
    <div className="flex flex-col gap-y-4">
      {/* Name */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-x-1">
          <label 
            className="font-sans txt-compact-small font-medium" 
            htmlFor="edit_name"
          >
            Nombre
          </label>
        </div>
        <div className="relative">
          <Input
            id="edit_name"
            name="name"
            type="text"
            value={formData.name}
            onChange={onInputChange}
            className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
            required
          />
        </div>
      </div>

      {/* Utilities */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-x-1">
          <label 
            className="font-sans txt-compact-small font-medium" 
            htmlFor="edit_utilities"
          >
            Utilidades
          </label>
        </div>
        <div className="relative">
          <Input
            id="edit_utilities"
            name="utilities"
            type="text"
            value={formData.utilities}
            onChange={onInputChange}
            className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
          />
        </div>
      </div>

      {/* Caption */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-x-1">
          <label 
            className="font-sans txt-compact-small font-medium" 
            htmlFor="edit_caption"
          >
            Caption
          </label>
        </div>
        <div className="relative">
          <Input
            id="edit_caption"
            name="caption"
            type="text"
            value={formData.caption}
            onChange={onInputChange}
            className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
          />
        </div>
      </div>

      {/* Position */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-x-1">
          <label 
            className="font-sans txt-compact-small font-medium" 
            htmlFor="edit_position"
          >
            Posición
          </label>
        </div>
        <div className="relative">
          <Input
            id="edit_position"
            name="position"
            type="number"
            value={formData.position || ""}
            onChange={onInputChange}
            className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
            min="0"
          />
        </div>
      </div>

      {/* ID Category */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-x-1">
          <label 
            className="font-sans txt-compact-small font-medium" 
            htmlFor="edit_id_category"
          >
            ID Categoría
          </label>
        </div>
        <div className="relative">
          <Input
            id="edit_id_category"
            name="id_category"
            type="number"
            value={formData.id_category || ""}
            onChange={onInputChange}
            className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
            min="1"
          />
        </div>
      </div>

      {/* Observations */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-x-1">
          <label 
            className="font-sans txt-compact-small font-medium" 
            htmlFor="edit_observations"
          >
            Observaciones
          </label>
        </div>
        <div className="relative">
          <Textarea
            id="edit_observations"
            name="observations"
            value={formData.observations}
            onChange={onInputChange}
            rows={4}
            className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small px-2 py-1.5"
            placeholder="Notas adicionales sobre esta opción..."
          />
        </div>
      </div>

      {/* Switches */}
      <div className="flex flex-col gap-y-3">
        <div className="flex items-center justify-between">
          <label className="font-sans txt-compact-small font-medium">
            Activo
          </label>
          <Switch
            checked={formData.active}
            onCheckedChange={(checked) => onSwitchChange('active', checked)}
          />
        </div>
      </div>
    </div>
  );

  const handleFormSubmit = (formData) => {
    console.log('📋 OptionDetail.handleFormSubmit INICIO', { formData, option });
    
    if (!option?.id) {
      console.error('❌ OptionDetail: No option ID found');
      return Promise.reject(new Error('No se puede actualizar: ID de la opción no encontrado'));
    }

    return updateOptionMutation.mutateAsync({ id: option.id, data: formData });
  };

  const handleDelete = (entity) => {
    console.log('🗑️ OptionDetail.handleDelete INICIO', { entity });
    
    if (!entity?.id) {
      console.error('❌ OptionDetail: No entity ID found for deletion');
      return Promise.reject(new Error('No se puede eliminar: ID de la opción no encontrado'));
    }

    return deleteOptionMutation.mutateAsync(entity.id);
  };

  // Mostrar loading si los datos están cargando
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-ui-fg-muted">Cargando...</div>
      </div>
    );
  }

  // Mostrar error si no se pudo cargar la opción
  if (optionError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-ui-fg-error">Error al cargar la opción: {optionError.message}</div>
      </div>
    );
  }

  // Mostrar mensaje si no se encontró la opción
  if (!option) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-ui-fg-muted">Opción no encontrada</div>
      </div>
    );
  }

  return (
    <DataLayout
      entityName="options"
      entityPluralName="Opciones"
      data={optionsData}
      entity={option}
      formData={formData}
      setFormData={setFormData}
      onInputChange={handleInputChange}
      onSwitchChange={handleSwitchChange}
      onEditSubmit={handleFormSubmit}
      onDelete={handleDelete}
      renderHeader={renderHeader}
      renderMainSections={renderMainSections}
      renderSidebar={renderSidebar}
      renderEditForm={renderEditForm}
      deleteVerificationField="name"
      editTitle="Editar Opción"
      deleteItemText="opción"
      customHandlers={customHandlers}
      // Estados de loading y error
      isLoading={updateOptionMutation.isPending || deleteOptionMutation.isPending}
      permissions={{
        canEdit,
        canDelete
      }}
    />
  );
}
