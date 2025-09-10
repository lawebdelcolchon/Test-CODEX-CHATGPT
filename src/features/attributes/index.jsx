// src/features/attributes/index.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Input, Badge, Button, Select, Textarea, Switch } from "@medusajs/ui";
import attributesData from "../../mocks/attributes.json";
import DataLayout from "../../layouts/DataLayout.jsx";

export default function AttributeDetail() {
  const { id } = useParams();
  
  // Encontrar el atributo por ID
  const attribute = attributesData.find(a => a.id === parseInt(id)) || attributesData[0]; // fallback al primer atributo
  
  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    name: attribute?.name || "",
    utilities: attribute?.utilities || "",
    caption: attribute?.caption || "",
    id_category: attribute?.id_category || null,
    level: attribute?.level || 0,
    parent: attribute?.parent || null,
    visible: Boolean(attribute?.visible),
    active: Boolean(attribute?.active)
  });
  
  // Update formData when attribute changes
  useEffect(() => {
    if (attribute) {
      setFormData({
        name: attribute?.name || "",
        utilities: attribute?.utilities || "",
        caption: attribute?.caption || "",
        id_category: attribute?.id_category || null,
        level: attribute?.level || 0,
        parent: attribute?.parent || null,
        visible: Boolean(attribute?.visible),
        active: Boolean(attribute?.active)
      });
    }
  }, [attribute]);
  
  // Input change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (name === 'level' || name === 'parent' || name === 'id_category') ? 
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
        name: attribute?.name || "",
        utilities: attribute?.utilities || "",
        caption: attribute?.caption || "",
        id_category: attribute?.id_category || null,
        level: attribute?.level || 0,
        parent: attribute?.parent || null,
        visible: Boolean(attribute?.visible),
        active: Boolean(attribute?.active)
      });
    },
    onDelete: (entity) => {
      // Handle delete logic here if needed
      console.log("Custom delete logic for attribute:", entity);
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
        <p className="font-medium font-sans txt-compact-small">Nivel</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.level || "0"}
        </p>
      </div>
      
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Visible</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.visible ? "Sí" : "No"}
        </p>
      </div>
      
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Atributo Padre</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.parent ? `#${entity.parent}` : "Raíz"}
        </p>
      </div>
    </>
  );
  
  const renderMainSections = ({ EmptyState, entity, Link, Button }) => (
    <>
      {/* Values Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Valores del Atributo</h2>
          <Link to={`/attribute-values/create?attribute=${entity.id}`}>
            <Button variant="secondary" size="small" className="txt-compact-small-plus gap-x-1.5 px-2 py-1">
              Agregar valor
            </Button>
          </Link>
        </div>
        <EmptyState 
          title="No hay registros"
          description="Este atributo no tiene valores configurados."
        />
      </div>

      {/* Products Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Productos Relacionados</h2>
          <Link to={`/products?attribute=${entity.id}`}>
            <Button variant="secondary" size="small" className="txt-compact-small-plus gap-x-1.5 px-2 py-1">
              Ver productos
            </Button>
          </Link>
        </div>
        <EmptyState 
          title="No hay registros"
          description="Este atributo no está asignado a ningún producto."
        />
      </div>
    </>
  );
  
  const renderSidebar = ({ entity, Link, Button, Badge, PencilSquare, mobile = false }) => (
    <>
      {/* Configuration Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Configuración</h2>
          <Link to={`/attributes/${entity.id}/config/edit`}>
            <Button variant="transparent" size="small" className="h-7 w-7 p-1 text-ui-fg-muted hover:text-ui-fg-subtle">
              <PencilSquare />
            </Button>
          </Link>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Caption</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
              {entity.caption || "Sin texto de caption"}
            </p>
          </div>
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">ID Categoría</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
              {entity.id_category ? `#${entity.id_category}` : "Sin categoría asociada"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Sub-attributes Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Sub-atributos</h2>
          <Link to={`/attributes/create?parent=${entity.id}`}>
            <Button variant="secondary" size="small" className="txt-compact-small-plus gap-x-1.5 px-2 py-1">
              Crear sub-atributo
            </Button>
          </Link>
        </div>
        <div className="px-6 py-4">
          <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
            {attributesData.filter(attr => attr.parent === entity.id).length} sub-atributos configurados
          </p>
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
        <Link to={`/attributes/${entity.id}/metadata/edit`}>
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

      {/* Level */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-x-1">
          <label 
            className="font-sans txt-compact-small font-medium" 
            htmlFor="edit_level"
          >
            Nivel
          </label>
        </div>
        <div className="relative">
          <Input
            id="edit_level"
            name="level"
            type="number"
            value={formData.level || ""}
            onChange={onInputChange}
            className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
            min="0"
          />
        </div>
      </div>

      {/* Parent Attribute */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-x-1">
          <label 
            className="font-sans txt-compact-small font-medium" 
            htmlFor="edit_parent"
          >
            Atributo Padre
          </label>
        </div>
        <div className="relative">
          <Select
            value={formData.parent?.toString() || "none"}
            onValueChange={(value) => handleInputChange({ 
              target: { 
                name: 'parent', 
                value: value === "none" ? null : parseInt(value) 
              } 
            })}
          >
            <Select.Trigger className="w-full">
              <Select.Value placeholder="Seleccionar atributo padre" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="none">Ninguno (Raíz)</Select.Item>
              {attributesData
                .filter(attr => attr.id !== attribute?.id)
                .map(attr => (
                  <Select.Item key={attr.id} value={attr.id.toString()}>
                    {attr.name}
                  </Select.Item>
                ))
              }
            </Select.Content>
          </Select>
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

      {/* Switches */}
      <div className="flex flex-col gap-y-3">
        <div className="flex items-center justify-between">
          <label className="font-sans txt-compact-small font-medium">
            Visible
          </label>
          <Switch
            checked={formData.visible}
            onCheckedChange={(checked) => onSwitchChange('visible', checked)}
          />
        </div>
        
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

  return (
    <DataLayout
      entityName="attributes"
      entityPluralName="Atributos"
      data={attributesData}
      entity={attribute}
      formData={formData}
      setFormData={setFormData}
      onInputChange={handleInputChange}
      onSwitchChange={handleSwitchChange}
      renderHeader={renderHeader}
      renderMainSections={renderMainSections}
      renderSidebar={renderSidebar}
      renderEditForm={renderEditForm}
      deleteVerificationField="name"
      editTitle="Editar Atributo"
      deleteItemText="atributo"
      customHandlers={customHandlers}
    />
  );
}
