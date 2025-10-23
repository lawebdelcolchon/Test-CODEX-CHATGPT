// src/features/categories/index.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Input, Badge, Button, Select, Textarea, Switch } from "@medusajs/ui";
import DataLayout from "../../layouts/DataLayout.jsx";
import { hasPermission } from "../../utils/permissions.js";
import { useSelector } from "react-redux";
import { useCategoryEditModal } from "../../contexts/CategoryEditModalContext.jsx";
import CategoryViewModal from "../../components/CategoryViewModal.jsx";
import {
  useCategoriesQuery,
  useCategoryQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} from "../../hooks/queries/useCategories.js";
import { useAttributesByCategoryQuery } from "../../hooks/queries/useAttributes.js";

export default function CategoryDetail() {
  const { id } = useParams();
  
  console.log('🔍 CategoryDetail: Componente cargado con ID:', id);
  console.log('🔍 CategoryDetail: URL actual:', window.location.pathname);
  
  // Hook para el contexto global del modal de edición
  const { openEditModal } = useCategoryEditModal();
  
  // Estado local para el modal de consulta
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canEdit = hasPermission(user, ['all', 'categories']);
  const canDelete = hasPermission(user, ['all', 'categories']);

  // Usar TanStack Query para obtener datos
  const {
    data: categoriesResult,
    isLoading: isCategoriesLoading
  } = useCategoriesQuery({ page: 1, pageSize: 100 });

  const {
    data: category,
    isLoading: isCategoryLoading,
    error: categoryError
  } = useCategoryQuery(id);

  // Hook para obtener atributos relacionados con esta categoría
  const {
    data: attributesResult,
    isLoading: isAttributesLoading
  } = useAttributesByCategoryQuery(id, { per_page: 100 });

  // Extraer datos para los selectores
  const categoriesData = categoriesResult?.items || [];
  const attributesData = attributesResult?.items || [];
  const isLoading = isCategoriesLoading || isCategoryLoading;

  // Funciones auxiliares para obtener nombres
  const getParentCategoryName = (parentId) => {
    if (!parentId) return null;
    const parentCategory = categoriesData.find(cat => cat.id === parentId);
    return parentCategory ? `#${parentId} - ${parentCategory.name}` : `#${parentId}`;
  };

  const getAttributeName = (attributeId) => {
    if (!attributeId) return null;
    const attribute = attributesData.find(attr => attr.id === attributeId);
    return attribute ? `#${attributeId} - ${attribute.name}` : `#${attributeId}`;
  };

  // Hooks de mutación - ahora sin estados locales
  const updateCategoryMutation = useUpdateCategoryMutation({
    onSuccess: (updatedCategory) => {
      console.log('✅ CategoryDetail: Categoría actualizada exitosamente:', updatedCategory);

      // IMPORTANTE: Actualizar el formData con los nuevos datos para reflejar cambios en el slide
      setFormData({
        name: updatedCategory.name || "",
        meta_keywords: updatedCategory.meta_keywords || "",
        meta_description: updatedCategory.meta_description || "",
        parent: updatedCategory.parent || null,
        position: updatedCategory.position || 0,
        visible: Boolean(updatedCategory.visible),
        active: Boolean(updatedCategory.active),
        id_attribute_first: updatedCategory.id_attribute_first || null,
        id_attribute_second: updatedCategory.id_attribute_second || null
      });
    },
    onError: (error) => {
      console.error('❌ CategoryDetail: Error detallado al actualizar categoría:', error);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error response:', error.response?.data);
      alert('Error al actualizar la categoría: ' + error.message);
    }
  });

  const deleteCategoryMutation = useDeleteCategoryMutation({
    onSuccess: (result, deletedId) => {
      // Si la categoría eliminada era la que se estaba viendo, redirigir
      if (String(deletedId) === String(id)) {
        // Redirigir a la lista principal
        window.location.href = '/categories';
      }
    },
    onError: (error) => {
      alert('Error al eliminar la categoría: ' + error.message);
    }
  });

  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    name: "",
    meta_keywords: "",
    meta_description: "",
    parent: null,
    position: 0,
    visible: true,
    active: true,
    id_attribute_first: null,
    id_attribute_second: null
  });

  // Update formData when category is loaded or updated
  useEffect(() => {
    if (category) {
      console.log('🔄 CategoryDetail: Sincronizando formData con datos de query:', category);
      setFormData({
        name: category.name || "",
        meta_keywords: category.meta_keywords || "",
        meta_description: category.meta_description || "",
        parent: category.parent || null,
        position: category.position || 0,
        visible: Boolean(category.visible),
        active: Boolean(category.active),
        id_attribute_first: category.id_attribute_first || null,
        id_attribute_second: category.id_attribute_second || null
      });
    }
  }, [category]);

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'position' || name === 'parent' || name === 'id_attribute_first' || name === 'id_attribute_second') ? (value === '' ? null : parseInt(value)) : value
    }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Manejador para actualizar categoría usando TanStack Query
  const handleFormSubmit = async (formData) => {
    console.log('📋 CategoryDetail.handleFormSubmit INICIO - formData:', formData);
    console.log('📋 CategoryDetail.handleFormSubmit INICIO - category.id:', category.id);
    console.log('📋 CategoryDetail.handleFormSubmit INICIO - category full object:', category);

    try {
      const result = await updateCategoryMutation.mutateAsync({
        id: category.id,
        data: formData
      });
      console.log('✅ CategoryDetail.handleFormSubmit ÉXITO - result:', result);
      return result;
    } catch (error) {
      console.error('❌ CategoryDetail.handleFormSubmit ERROR CAPTURADO:', error);
      console.error('❌ CategoryDetail.handleFormSubmit ERROR message:', error.message);
      console.error('❌ CategoryDetail.handleFormSubmit ERROR stack:', error.stack);
      console.error('❌ CategoryDetail.handleFormSubmit ERROR response:', error.response);
      throw error; // Re-lanzar el error para que el DataLayout lo maneje
    }
  };

  // Manejador para eliminar categoría usando TanStack Query
  const handleDelete = async (entity) => {
    console.log('🗁️ Eliminando categoría con TanStack Query:', entity.id);
    return deleteCategoryMutation.mutateAsync(entity.id);
  };

  // Custom handlers con verificación de permisos
  const customHandlers = {
    onEdit: () => {
      if (!canEdit) {
        console.warn('🚫 Usuario no tiene permisos para editar categorías');
        alert('No tienes permisos para editar categorías');
        return;
      }
      // Abrir el modal global de edición en lugar del drawer
      console.log('🟢 CategoryDetail: Abriendo modal de edición para categoría:', category);
      openEditModal(category);
      return false; // Evitar que DataLayout abra el drawer
    },
    onDelete: (entity) => {
      if (!canDelete) {
        console.warn('🚫 Usuario no tiene permisos para eliminar categorías');
        alert('No tienes permisos para eliminar categorías');
        return;
      }
      // Ejecutar lógica de eliminación
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
        <Button 
          variant="secondary" 
          size="small" 
          onClick={() => setIsViewModalOpen(true)}
          className="txt-compact-small-plus gap-x-1.5 px-2 py-1"
        >
          Ver detalles
        </Button>
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
          {entity.parent ? getParentCategoryName(entity.parent) || `#${entity.parent}` : "Raíz"}
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

      {/* Tree Structure Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Árbol Jerárquico</h2>
        </div>
        <div className="px-6 py-4">
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Estructura</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle font-mono text-xs bg-ui-bg-subtle p-2 rounded">
              {entity.tree || "Sin estructura jerárquica definida"}
            </p>
          </div>
        </div>
      </div>

      {/* Attributes Section */}
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-sans font-medium h2-core">Atributos</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Atributo Primario</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
              {entity.id_attribute_first ? getAttributeName(entity.id_attribute_first) : "No asignado"}
            </p>
          </div>
          <div>
            <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Atributo Secundario</p>
            <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
              {entity.id_attribute_second ? getAttributeName(entity.id_attribute_second) : "No asignado"}
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

      {/* Attribute First */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-x-1">
          <label
            className="font-sans txt-compact-small font-medium"
            htmlFor="edit_attribute_first"
          >
            Atributo Primario
          </label>
        </div>
        <div className="relative">
          <Select
            value={formData.id_attribute_first?.toString() || "none"}
            onValueChange={(value) => handleInputChange({
              target: {
                name: 'id_attribute_first',
                value: value === "none" ? null : parseInt(value)
              }
            })}
          >
            <Select.Trigger className="w-full">
              <Select.Value placeholder="Seleccionar atributo primario" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="none">Ninguno</Select.Item>
              {attributesData.map(attr => (
                <Select.Item key={attr.id} value={attr.id.toString()}>
                  {attr.name} {attr.utilities ? `(${attr.utilities})` : ''}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        {isAttributesLoading && (
          <p className="text-xs text-ui-fg-muted">Cargando atributos...</p>
        )}
      </div>

      {/* Attribute Second */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-x-1">
          <label
            className="font-sans txt-compact-small font-medium"
            htmlFor="edit_attribute_second"
          >
            Atributo Secundario
          </label>
        </div>
        <div className="relative">
          <Select
            value={formData.id_attribute_second?.toString() || "none"}
            onValueChange={(value) => handleInputChange({
              target: {
                name: 'id_attribute_second',
                value: value === "none" ? null : parseInt(value)
              }
            })}
          >
            <Select.Trigger className="w-full">
              <Select.Value placeholder="Seleccionar atributo secundario" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="none">Ninguno</Select.Item>
              {attributesData.map(attr => (
                <Select.Item key={attr.id} value={attr.id.toString()}>
                  {attr.name} {attr.utilities ? `(${attr.utilities})` : ''}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        {isAttributesLoading && (
          <p className="text-xs text-ui-fg-muted">Cargando atributos...</p>
        )}
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
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-2 text-ui-fg-muted">Cargando categoría...</p>
          <p className="mt-1 text-xs text-ui-fg-muted">ID: {id}</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no hay categoría después de cargar
  if (!category && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Categoría no encontrada</h2>
          <p className="text-gray-500 mb-4">No se pudo cargar la categoría con ID: {id}</p>
          {categoryError && (
            <p className="text-sm text-red-600">Error: {categoryError.message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <DataLayout
        entityName="categories"
        entityPluralName="Categorías"
        data={categoriesData}
        entity={category}
        formData={formData}
        setFormData={setFormData}
        onInputChange={handleInputChange}
        onSwitchChange={handleSwitchChange}
        onFormSubmit={handleFormSubmit}
        renderHeader={renderHeader}
        renderMainSections={renderMainSections}
        renderSidebar={renderSidebar}
        renderEditForm={renderEditForm}
        deleteVerificationField="name"
        editTitle="Editar Categoría"
        deleteItemText="categoría"
        customHandlers={customHandlers}
      />
      
      {/* Modal de consulta */}
      <CategoryViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        category={category}
      />
    </>
  );
}