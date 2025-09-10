// src/features/categories/index.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Input, Badge, Button, Select, Textarea, Switch } from "@medusajs/ui";
import genericApi from "../../services/genericApi.js";
import DataLayout from "../../layouts/DataLayout.jsx";
import { hasPermission } from "../../utils/permissions.js";
import { useSelector } from "react-redux";

export default function CategoryDetail() {
  const { id } = useParams();
  
  // Estados para carga de datos
  const [categoriesData, setCategoriesData] = useState([]);
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canEdit = hasPermission(user, ['all', 'categories']);
  const canDelete = hasPermission(user, ['all', 'categories']);
  
  // Cargar categorías desde la API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        // Intentar cargar desde la API primero
        const response = await genericApi.list('categories', { page: 1, pageSize: 100 });
        setCategoriesData(response.items || []);
        console.log('✅ Categories loaded from API:', response.items?.length);
      } catch (error) {
        console.warn('⚠️ Failed to load categories from API:', error);
        // En caso de error, mantener array vacío
        setCategoriesData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCategories();
  }, []);
  
  // Buscar la categoría por ID cuando cambien los datos
  useEffect(() => {
    if (categoriesData.length > 0) {
      const foundCategory = categoriesData.find(c => String(c.id) === String(id)) || categoriesData[0];
      setCategory(foundCategory);
    }
  }, [categoriesData, id]);
  
  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    name: "",
    meta_keywords: "",
    meta_description: "",
    parent: null,
    position: 0,
    visible: true,
    active: true
  });
  
  // Update formData when category is loaded
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        meta_keywords: category.meta_keywords || "",
        meta_description: category.meta_description || "",
        parent: category.parent || null,
        position: category.position || 0,
        visible: Boolean(category.visible),
        active: Boolean(category.active)
      });
    }
  }, [category]);
  
  // Input change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'position' || name === 'parent') ? (value === '' ? null : parseInt(value)) : value
    }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Custom handlers con verificación de permisos
  const customHandlers = {
    onEdit: () => {
      if (!canEdit) {
        console.warn('🚫 Usuario no tiene permisos para editar categorías');
        return;
      }
      // Refresh formData when edit starts
      setFormData({
        name: category?.name || "",
        meta_keywords: category?.meta_keywords || "",
        meta_description: category?.meta_description || "",
        parent: category?.parent || null,
        position: category?.position || 0,
        visible: Boolean(category?.visible),
        active: Boolean(category?.active)
      });
    },
    onDelete: (entity) => {
      if (!canDelete) {
        console.warn('🚫 Usuario no tiene permisos para eliminar categorías');
        return;
      }
      // Handle delete logic here if needed
      console.log("Custom delete logic for category:", entity);
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
        <p className="font-medium font-sans txt-compact-small">Posición</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.position || "-"}
        </p>
      </div>
      
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Visible</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.visible ? "Sí" : "No"}
        </p>
      </div>
      
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <p className="font-medium font-sans txt-compact-small">Categoría Padre</p>
        <p className="font-normal font-sans txt-compact-small">
          {entity.parent ? `#${entity.parent}` : "Raíz"}
        </p>
      </div>
    </>
  );
  
  const renderMainSections = ({ EmptyState, entity, Link, Button }) => (
    <>
      {/* Products Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Productos</h2>
          <Link to={`/products?category=${entity.id}`}>
            <Button variant="secondary" size="small" className="txt-compact-small-plus gap-x-1.5 px-2 py-1">
              Ver productos
            </Button>
          </Link>
        </div>
        <EmptyState 
          title="No hay registros"
          description="Esta categoría no tiene productos asignados."
        />
      </div>

      {/* Subcategories Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Subcategorías</h2>
          <Link to={`/categories/create?parent=${entity.id}`}>
            <Button variant="secondary" size="small" className="txt-compact-small-plus gap-x-1.5 px-2 py-1">
              Crear subcategoría
            </Button>
          </Link>
        </div>
        <EmptyState 
          title="No hay registros"
          description="Esta categoría no tiene subcategorías."
        />
      </div>
    </>
  );
  
  const renderSidebar = ({ entity, Link, Button, Badge, PencilSquare, mobile = false }) => (
    <>
      {/* SEO Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">SEO</h2>
          <Link to={`/categories/${entity.id}/seo/edit`}>
            <Button variant="transparent" size="small" className="h-7 w-7 p-1 text-ui-fg-muted hover:text-ui-fg-subtle">
              <PencilSquare />
            </Button>
          </Link>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Meta Keywords</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
              {entity.meta_keywords || "No se han definido keywords"}
            </p>
          </div>
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Meta Description</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
              {entity.meta_description || "No se ha definido una descripción"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Metadata Section */}
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
        <Link to={`/categories/${entity.id}/metadata/edit`}>
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
          />
        </div>
      </div>

      {/* Parent Category */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-x-1">
          <label 
            className="font-sans txt-compact-small font-medium" 
            htmlFor="edit_parent"
          >
            Categoría Padre
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
              <Select.Value placeholder="Seleccionar categoría padre" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="none">Ninguna (Raíz)</Select.Item>
              {categoriesData
                .filter(cat => cat.id !== category?.id)
                .map(cat => (
                  <Select.Item key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </Select.Item>
                ))
              }
            </Select.Content>
          </Select>
        </div>
      </div>

      {/* Meta Keywords */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-x-1">
          <label 
            className="font-sans txt-compact-small font-medium" 
            htmlFor="edit_meta_keywords"
          >
            Meta Keywords
          </label>
        </div>
        <div className="relative">
          <Input
            id="edit_meta_keywords"
            name="meta_keywords"
            type="text"
            value={formData.meta_keywords}
            onChange={onInputChange}
            className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small h-8 px-2 py-1.5"
          />
        </div>
      </div>

      {/* Meta Description */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-x-1">
          <label 
            className="font-sans txt-compact-small font-medium" 
            htmlFor="edit_meta_description"
          >
            Meta Description
          </label>
        </div>
        <div className="relative">
          <Textarea
            id="edit_meta_description"
            name="meta_description"
            value={formData.meta_description}
            onChange={onInputChange}
            rows={3}
            className="caret-ui-fg-base bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active txt-compact-small px-2 py-1.5"
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

  // Mostrar loading mientras se cargan los datos
  if (isLoading || !category) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-2 text-ui-fg-muted">Cargando categoría...</p>
        </div>
      </div>
    );
  }

  return (
    <DataLayout
      entityName="categories"
      entityPluralName="Categorías"
      data={categoriesData}
      entity={category}
      formData={formData}
      setFormData={setFormData}
      onInputChange={handleInputChange}
      onSwitchChange={handleSwitchChange}
      renderHeader={renderHeader}
      renderMainSections={renderMainSections}
      renderSidebar={renderSidebar}
      renderEditForm={renderEditForm}
      deleteVerificationField="name"
      editTitle="Editar Categoría"
      deleteItemText="categoría"
      customHandlers={customHandlers}
    />
  );
}