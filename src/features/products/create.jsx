// src/features/products/create.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Badge, Button, Select, Textarea, Switch } from "@medusajs/ui";
import { ArrowLeft, XMarkMini } from "@medusajs/icons";
import { hasPermission } from "../../utils/permissions.js";
import { useSelector } from "react-redux";
import {
  useCreateProductMutation
} from "../../hooks/queries/useProducts.js";
import { useCategoriesQuery } from "../../hooks/queries/useCategories.js";

export default function CreateProduct() {
  const navigate = useNavigate();
  
  // Obtener usuario y verificar permisos
  const { user } = useSelector((state) => state.auth);
  const canCreate = hasPermission(user, ['all', 'products']);

  // Usar TanStack Query para obtener datos
  const {
    data: categoriesResult,
    isLoading: isCategoriesLoading
  } = useCategoriesQuery({ page: 1, pageSize: 100 });

  // Extraer datos para los selectores
  const categoriesData = categoriesResult?.items || [];

  // Hook de mutación para crear producto
  const createProductMutation = useCreateProductMutation({
    onSuccess: (createdProduct) => {
      console.log('✅ CreateProduct: Producto creado exitosamente:', createdProduct);
      // Navegar a la lista de productos después de crear
      navigate('/products');
    },
    onError: (error) => {
      console.error('❌ CreateProduct: Error al crear producto:', error);
      alert('Error al crear el producto: ' + error.message);
    }
  });

  // Estado para el formulario de creación
  const [formData, setFormData] = useState({
    name: "",
    tag_extra: "",
    tag_extra_name: "",
    url_image: "",
    description: "",
    id_category: null,
    code: "",
    tax: 0,
    units: "unidad",
    comments: "",
    meta_title: "",
    meta_keywords: "",
    meta_description: "",
    marked: false,
    visible: true,
    active: true
  });

  // Auto-generar tag_extra, tag_extra_name y meta_title desde el nombre
  useEffect(() => {
    if (formData.name.trim()) {
      const name = formData.name.trim();
      const tag_extra = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
        .replace(/\s+/g, '-') // Espacios a guiones
        .replace(/(^-|-$)/g, ''); // Remover guiones del inicio/final
      
      setFormData(prev => ({ 
        ...prev, 
        tag_extra: prev.tag_extra.trim() === '' ? tag_extra : prev.tag_extra,
        tag_extra_name: prev.tag_extra_name.trim() === '' ? name : prev.tag_extra_name,
        meta_title: prev.meta_title.trim() === '' ? name : prev.meta_title
      }));
    }
  }, [formData.name]);

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'tax' ? (value === '' ? 0 : parseFloat(value)) :
              name === 'id_category' ? (value === '' ? null : parseInt(value)) : 
              value
    }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Manejador para crear producto
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('📋 CreateProduct.handleFormSubmit INICIO - formData:', formData);
    
    // Validaciones básicas
    if (!formData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('La descripción es requerida');
      return;
    }
    
    if (!formData.code.trim()) {
      alert('El código del producto es requerido');
      return;
    }
    
    if (!formData.id_category) {
      alert('La categoría es requerida');
      return;
    }
    
    if (!formData.meta_title.trim()) {
      alert('El meta title es requerido');
      return;
    }

    try {
      // Limpiar datos y preparar para envío
      const cleanString = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/\\"/g, '"').replace(/"/g, '').trim();
      };

      const productData = {
        // Campos requeridos según el modelo Product
        name: cleanString(formData.name),
        tag_extra: cleanString(formData.tag_extra) || '',
        tag_extra_name: cleanString(formData.tag_extra_name) || '',
        url_image: cleanString(formData.url_image) || '',
        description: cleanString(formData.description),
        id_category: parseInt(formData.id_category) || null,
        code: cleanString(formData.code),
        tax: parseFloat(formData.tax) || 0,
        units: cleanString(formData.units) || 'unidad',
        comments: cleanString(formData.comments) || '',
        meta_title: cleanString(formData.meta_title),
        meta_keywords: cleanString(formData.meta_keywords) || '',
        meta_description: cleanString(formData.meta_description) || '',
        
        // Estados booleanos
        marked: Boolean(formData.marked),
        visible: Boolean(formData.visible),
        active: Boolean(formData.active)
      };

      console.log('📝 Submitting product data:', productData);
      const result = await createProductMutation.mutateAsync(productData);
      console.log('✅ CreateProduct.handleFormSubmit ÉXITO - result:', result);
    } catch (error) {
      console.error('❌ CreateProduct.handleFormSubmit ERROR:', error);
    }
  };

  const handleBack = () => {
    navigate('/products');
  };

  // Si no tiene permisos
  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13-9a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Acceso Denegado</h2>
        <p className="text-gray-500 mb-4">No tienes permisos para crear productos.</p>
      </div>
    );
  }

  // Obtener nombre de categoría
  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Sin categoría';
    const category = categoriesData.find(cat => cat.id === categoryId);
    return category ? `#${categoryId} - ${category.name}` : `#${categoryId}`;
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
        <span className="text-ui-fg-muted txt-small">Volver a Productos</span>
      </div>
      
      <div className="flex w-full flex-col items-start gap-x-4 gap-y-3 xl:grid xl:grid-cols-[minmax(0,_1fr)_440px]">
        {/* Main Content */}
        <div className="flex w-full min-w-0 flex-col gap-y-3">
          {/* Header */}
          <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <h1 className="font-sans font-medium h1-core">Crear Nuevo Producto</h1>
              <div className="flex items-center gap-x-2">
                <Badge
                  variant="secondary"
                  size="small"
                  className="txt-compact-xsmall-plus bg-ui-bg-subtle text-ui-fg-subtle border-ui-border-base"
                >
                  Nuevo
                </Badge>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="font-sans font-medium h2-core">Información del Producto</h2>
            </div>
            <form onSubmit={handleFormSubmit} className="px-6 py-4">
              <div className="flex flex-col gap-y-4">
                {/* Basic Info */}
                <div className="flex flex-col space-y-2">
                  <label className="font-sans txt-compact-small font-medium">Nombre *</label>
                  <Input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-sans txt-compact-small font-medium">Código *</label>
                  <Input
                    name="code"
                    type="text"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-sans txt-compact-small font-medium">Descripción *</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    required
                  />
                </div>

                {/* Price & Tax */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2">
                    <label className="font-sans txt-compact-small font-medium">Impuesto (%)</label>
                    <Input
                      name="tax"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.tax || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="font-sans txt-compact-small font-medium">Unidades</label>
                    <Select
                      value={formData.units}
                      onValueChange={(value) => handleInputChange({
                        target: { name: 'units', value }
                      })}
                    >
                      <Select.Trigger className="w-full">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="unidad">Unidad</Select.Item>
                        <Select.Item value="kg">Kilogramos</Select.Item>
                        <Select.Item value="g">Gramos</Select.Item>
                        <Select.Item value="l">Litros</Select.Item>
                        <Select.Item value="ml">Mililitros</Select.Item>
                        <Select.Item value="m">Metros</Select.Item>
                        <Select.Item value="cm">Centímetros</Select.Item>
                      </Select.Content>
                    </Select>
                  </div>
                </div>

                {/* Category */}
                <div className="flex flex-col space-y-2">
                  <label className="font-sans txt-compact-small font-medium">Categoría *</label>
                  <Select
                    value={formData.id_category?.toString() || "none"}
                    onValueChange={(value) => handleInputChange({
                      target: {
                        name: 'id_category',
                        value: value === "none" ? null : parseInt(value)
                      }
                    })}
                  >
                    <Select.Trigger className="w-full">
                      <Select.Value placeholder="Seleccionar categoría" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="none">Sin categoría</Select.Item>
                      {categoriesData.map(cat => (
                        <Select.Item key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>

                {/* SEO */}
                <div className="flex flex-col space-y-2">
                  <label className="font-sans txt-compact-small font-medium">Meta Title *</label>
                  <Input
                    name="meta_title"
                    type="text"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-sans txt-compact-small font-medium">Meta Description</label>
                  <Textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-sans txt-compact-small font-medium">Meta Keywords</label>
                  <Input
                    name="meta_keywords"
                    type="text"
                    value={formData.meta_keywords}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Optional Fields */}
                <div className="flex flex-col space-y-2">
                  <label className="font-sans txt-compact-small font-medium">URL de Imagen</label>
                  <Input
                    name="url_image"
                    type="url"
                    value={formData.url_image}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-sans txt-compact-small font-medium">Comentarios</label>
                  <Textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                {/* Tag Extra Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2">
                    <label className="font-sans txt-compact-small font-medium">Tag Extra</label>
                    <Input
                      name="tag_extra"
                      type="text"
                      value={formData.tag_extra}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="font-sans txt-compact-small font-medium">Tag Extra Name</label>
                    <Input
                      name="tag_extra_name"
                      type="text"
                      value={formData.tag_extra_name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Switches */}
                <div className="flex flex-col gap-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-sans txt-compact-small font-medium">Activo</label>
                    <Switch
                      checked={formData.active}
                      onCheckedChange={(checked) => handleSwitchChange('active', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="font-sans txt-compact-small font-medium">Visible</label>
                    <Switch
                      checked={formData.visible}
                      onCheckedChange={(checked) => handleSwitchChange('visible', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="font-sans txt-compact-small font-medium">Marcado/Destacado</label>
                    <Switch
                      checked={formData.marked}
                      onCheckedChange={(checked) => handleSwitchChange('marked', checked)}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="small"
                    onClick={handleBack}
                    className="txt-compact-small-plus gap-x-1.5 px-2 py-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    variant="primary" 
                    size="small"
                    disabled={createProductMutation.isLoading}
                    className="shadow-buttons-inverted text-ui-contrast-fg-primary bg-ui-button-inverted txt-compact-small-plus gap-x-1.5 px-2 py-1"
                  >
                    {createProductMutation.isLoading ? 'Creando...' : 'Crear Producto'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar - Preview */}
        <div className="hidden flex-col gap-y-3 xl:flex">
          {/* Preview Card */}
          <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="font-sans font-medium h2-core">Vista Previa</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Nombre</p>
                <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
                  {formData.name || "Sin nombre"}
                </p>
              </div>
              <div>
                <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Código</p>
                <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
                  {formData.code || "Sin código"}
                </p>
              </div>
              <div>
                <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Categoría</p>
                <p className="font-normal font-sans txt-compact-small text-ui-fg-subtle">
                  {getCategoryName(formData.id_category)}
                </p>
              </div>
              <div>
                <p className="font-medium font-sans txt-compact-small text-ui-fg-base mb-1">Estados</p>
                <div className="flex flex-wrap gap-1">
                  {formData.active && (
                    <Badge variant="default" size="small">Activo</Badge>
                  )}
                  {formData.visible && (
                    <Badge variant="default" size="small">Visible</Badge>
                  )}
                  {formData.marked && (
                    <Badge variant="default" size="small">Marcado</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}