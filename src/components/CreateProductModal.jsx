import React, { useState, useEffect } from 'react';
import { useCreateProductMutation } from '../hooks/queries/useProducts.js';
import { useCategoriesQuery } from '../hooks/queries/useCategories.js';

const CreateProductModal = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '', // SKU se mapea a code en DecorLujo
    id_category: null, // category_id se mapea a id_category
    tax: '0',
    units: 'UDS.',
    meta_title: '',
    // Campos específicos de DecorLujo
    tag_extra: '',
    tag_extra_name: '',
    url_image: '',
    comments: '',
    meta_description: '',
    meta_keywords: '',
    active: true,
    visible: true,
    marked: false
  });

  const [errors, setErrors] = useState({});

  // Hooks para la API
  const createProductMutation = useCreateProductMutation({
    onSuccess: (newProduct) => {
      console.log('✅ Product created successfully:', newProduct);
      
      // Limpiar formulario
      resetForm();
      
      // Cerrar modal
      onClose();
      
      // Callback opcional para el componente padre
      if (onSuccess) {
        onSuccess(newProduct);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to create product:', error);
      
      // Mostrar errores en el formulario
      if (error.data?.errors) {
        setErrors(error.data.errors);
      } else {
        setErrors({ 
          general: error.message || 'Error al crear el producto' 
        });
      }
    }
  });

  // Hook para obtener categorías activas
  const { 
    data: categoriesData, 
    isLoading: categoriesLoading,
    error: categoriesError 
  } = useCategoriesQuery({ 
    page: 1,
    pageSize: 100 
  });

  const availableCategories = categoriesData?.items || [];

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      code: '',
      id_category: null,
      tax: '0',
      units: 'UDS.',
      meta_title: '',
      tag_extra: '',
      tag_extra_name: '',
      url_image: '',
      comments: '',
      meta_description: '',
      meta_keywords: '',
      active: true,
      visible: true,
      marked: false
    });
    setErrors({});
  };

  // Reset form cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

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
    } else {
      // Si no hay nombre, limpiar los campos auto-generados
      setFormData(prev => ({ 
        ...prev, 
        tag_extra: prev.tag_extra.trim() === formData.name ? '' : prev.tag_extra,
        tag_extra_name: prev.tag_extra_name.trim() === formData.name ? '' : prev.tag_extra_name,
        meta_title: prev.meta_title.trim() === formData.name ? '' : prev.meta_title
      }));
    }
  }, [formData.name]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Limpiar cualquier comilla doble escapada que pueda haber entrado
    let cleanValue = value;
    if (type === 'text' || type === 'textarea') {
      cleanValue = value.replace(/\\"/g, '"').replace(/"/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : cleanValue
    }));

    // Limpiar errores del campo modificado
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones básicas según modelo DecorLujo
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'El código del producto es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.meta_title.trim()) {
      newErrors.meta_title = 'El meta title es requerido';
    }

    if (formData.tax && (parseFloat(formData.tax) < 0 || parseFloat(formData.tax) > 100)) {
      newErrors.tax = 'El impuesto debe ser un porcentaje entre 0 y 100';
    }

    if (!formData.id_category) {
      newErrors.id_category = 'La categoría es requerida';
    }

    // tag_extra y tag_extra_name pueden estar vacíos según producto existente ID 265
    // if (!formData.tag_extra.trim()) {
    //   newErrors.tag_extra = 'El tag extra es requerido (debería generarse automáticamente desde el nombre)';
    // }

    // if (!formData.tag_extra_name.trim()) {
    //   newErrors.tag_extra_name = 'El tag extra name es requerido (debería generarse automáticamente desde el nombre)';
    // }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Preparar datos para envío según modelo DecorLujo
    // Función para limpiar strings de comillas dobles
    const cleanString = (str) => {
      if (typeof str !== 'string') return str;
      return str.replace(/\\"/g, '"').replace(/"/g, '').trim();
    };
    
    // Auto-generar campos si están vacíos (fallback)
    const name = cleanString(formData.name);
    const tag_extra_fallback = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const productData = {
      // Campos requeridos - no pueden estar vacíos
      name: name,
      description: cleanString(formData.description),
      code: cleanString(formData.code),
      id_category: parseInt(formData.id_category) || null,
      tax: parseFloat(formData.tax) || 0,
      units: cleanString(formData.units) || 'UDS.',
      meta_title: cleanString(formData.meta_title) || name,
      tag_extra: cleanString(formData.tag_extra) || tag_extra_fallback,
      tag_extra_name: cleanString(formData.tag_extra_name) || name,
      
      // Campos opcionales - deben ser strings vacíos no null
      url_image: cleanString(formData.url_image) || '',
      comments: cleanString(formData.comments) || '',
      meta_description: cleanString(formData.meta_description) || '',
      meta_keywords: cleanString(formData.meta_keywords) || '',
      
      // Estados booleanos
      active: Boolean(formData.active),
      visible: Boolean(formData.visible),
      marked: Boolean(formData.marked)
    };

    console.log('🧹 Datos de formulario (antes de limpiar):', {
      name: formData.name,
      description: formData.description,
      meta_title: formData.meta_title,
      tag_extra_name: formData.tag_extra_name
    });
    
    console.log('📝 Submitting product data:', productData);
    console.log('🔍 Required fields check:');
    console.log('  - name:', productData.name, '(length:', productData.name.length, ')');
    console.log('  - description:', productData.description, '(length:', productData.description.length, ')');
    console.log('  - code:', productData.code, '(length:', productData.code.length, ')');
    console.log('  - id_category:', productData.id_category, '(type:', typeof productData.id_category, ')');
    console.log('  - tax:', productData.tax, '(type:', typeof productData.tax, ')');
    console.log('  - units:', productData.units, '(length:', productData.units.length, ')');
    console.log('  - meta_title:', productData.meta_title, '(length:', productData.meta_title.length, ')');
    console.log('  - tag_extra:', productData.tag_extra, '(length:', productData.tag_extra.length, ')');
    console.log('  - tag_extra_name:', productData.tag_extra_name, '(length:', productData.tag_extra_name.length, ')');
    console.log('🧪 JSON que se enviará:', JSON.stringify(productData, null, 2));
    
    // Versión simplificada solo con campos requeridos para test
    const simplifiedData = {
      name: productData.name,
      description: productData.description,
      code: productData.code,
      id_category: productData.id_category,
      tax: productData.tax,
      units: productData.units,
      meta_title: productData.meta_title,
      tag_extra: productData.tag_extra,
      tag_extra_name: productData.tag_extra_name
    };
    
    console.log('📋 Versión simplificada:', JSON.stringify(simplifiedData, null, 2));
    
    // Test con datos mínimos pero más realistas (similares al producto 265)
    // Usar código simple sin caracteres especiales como el producto real
    const minimalData = {
      name: productData.name,
      description: productData.description,
      code: productData.code.replace(/[-_]/g, ''), // Eliminar guiones y guiones bajos
      id_category: productData.id_category,
      tax: productData.tax,
      units: productData.units,
      meta_title: productData.meta_title,
      tag_extra: '', // Vacío como en producto 265
      tag_extra_name: '', // Vacío como en producto 265
      url_image: '', // String vacío
      comments: '', // String vacío
      meta_keywords: '', // String vacío
      meta_description: '', // String vacío
      marked: false,
      visible: true,
      active: true
    };
    
    console.log('🧪 Test con datos mínimos (incluyendo campos requeridos por validación del cliente):', JSON.stringify(minimalData, null, 2));
    
    // Probar primero con datos mínimos pero completos
    createProductMutation.mutate(minimalData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal */}
        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Crear Nuevo Producto
                  </h3>
                  <div className="mt-4">
                    {/* Error general */}
                    {errors.general && (
                      <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{errors.general}</span>
                      </div>
                    )}

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 gap-4">
                      {/* Name */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md px-3 py-2 ${
                            errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                          placeholder="Nombre del producto"
                        />
                        {errors.name && (
                          <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>

                      {/* Code */}
                      <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                          Código del Producto *
                        </label>
                        <input
                          type="text"
                          name="code"
                          id="code"
                          value={formData.code}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md px-3 py-2 ${
                            errors.code ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                          placeholder="Código único del producto"
                        />
                        {errors.code && (
                          <p className="mt-2 text-sm text-red-600">{errors.code}</p>
                        )}
                      </div>

                      {/* Tax and Units */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="tax" className="block text-sm font-medium text-gray-700">
                            Impuesto (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            name="tax"
                            id="tax"
                            value={formData.tax}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md px-3 py-2 ${
                              errors.tax ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                            placeholder="0"
                          />
                          {errors.tax && (
                            <p className="mt-2 text-sm text-red-600">{errors.tax}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="units" className="block text-sm font-medium text-gray-700">
                            Unidades
                          </label>
                          <select
                            name="units"
                            id="units"
                            value={formData.units}
                            onChange={handleInputChange}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="unidad">Unidad</option>
                            <option value="kg">Kilogramos</option>
                            <option value="g">Gramos</option>
                            <option value="l">Litros</option>
                            <option value="ml">Mililitros</option>
                            <option value="m">Metros</option>
                            <option value="cm">Centímetros</option>
                          </select>
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <label htmlFor="id_category" className="block text-sm font-medium text-gray-700">
                          Categoría *
                        </label>
                        <select
                          name="id_category"
                          id="id_category"
                          value={formData.id_category || ''}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md px-3 py-2 ${
                            errors.id_category ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                          disabled={categoriesLoading}
                        >
                          <option value="">Seleccionar categoría</option>
                          {availableCategories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {categoriesLoading && (
                          <p className="mt-1 text-sm text-gray-500">Cargando categorías...</p>
                        )}
                        {errors.id_category && (
                          <p className="mt-2 text-sm text-red-600">{errors.id_category}</p>
                        )}
                      </div>

                      {/* Descriptions */}
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Descripción *
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          rows="3"
                          value={formData.description}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md px-3 py-2 ${
                            errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                          placeholder="Descripción completa del producto"
                        />
                        {errors.description && (
                          <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                        )}
                      </div>

                      {/* Meta Title */}
                      <div>
                        <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700">
                          Meta Title *
                        </label>
                        <input
                          type="text"
                          name="meta_title"
                          id="meta_title"
                          value={formData.meta_title}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md px-3 py-2 ${
                            errors.meta_title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                          placeholder="Título para SEO"
                        />
                        {errors.meta_title && (
                          <p className="mt-2 text-sm text-red-600">{errors.meta_title}</p>
                        )}
                      </div>

                      {/* Tag Extra Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="tag_extra" className="block text-sm font-medium text-gray-700">
                            Tag Extra
                          </label>
                          <input
                            type="text"
                            name="tag_extra"
                            id="tag_extra"
                            value={formData.tag_extra}
                            onChange={handleInputChange}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Tag extra (generado automáticamente)"
                          />
                        </div>

                        <div>
                          <label htmlFor="tag_extra_name" className="block text-sm font-medium text-gray-700">
                            Tag Extra Name
                          </label>
                          <input
                            type="text"
                            name="tag_extra_name"
                            id="tag_extra_name"
                            value={formData.tag_extra_name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nombre del tag extra"
                          />
                        </div>
                      </div>

                      {/* Optional Fields */}
                      <div>
                        <label htmlFor="url_image" className="block text-sm font-medium text-gray-700">
                          URL de Imagen
                        </label>
                        <input
                          type="url"
                          name="url_image"
                          id="url_image"
                          value={formData.url_image}
                          onChange={handleInputChange}
                          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                      </div>

                      <div>
                        <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                          Comentarios
                        </label>
                        <textarea
                          name="comments"
                          id="comments"
                          rows="2"
                          value={formData.comments}
                          onChange={handleInputChange}
                          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Comentarios adicionales"
                        />
                      </div>

                      {/* SEO Fields */}
                      <div>
                        <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">
                          Meta Description
                        </label>
                        <textarea
                          name="meta_description"
                          id="meta_description"
                          rows="2"
                          value={formData.meta_description}
                          onChange={handleInputChange}
                          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Descripción para SEO"
                        />
                      </div>

                      <div>
                        <label htmlFor="meta_keywords" className="block text-sm font-medium text-gray-700">
                          Meta Keywords
                        </label>
                        <input
                          type="text"
                          name="meta_keywords"
                          id="meta_keywords"
                          value={formData.meta_keywords}
                          onChange={handleInputChange}
                          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="palabras, clave, separadas, por, comas"
                        />
                      </div>

                      {/* Status Checkboxes */}
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            id="active"
                            name="active"
                            type="checkbox"
                            checked={formData.active}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                            Activo
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            id="visible"
                            name="visible"
                            type="checkbox"
                            checked={formData.visible}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="visible" className="ml-2 block text-sm text-gray-900">
                            Visible
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            id="marked"
                            name="marked"
                            type="checkbox"
                            checked={formData.marked}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="marked" className="ml-2 block text-sm text-gray-900">
                            Marcado/Destacado
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={createProductMutation.isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createProductMutation.isLoading ? 'Creando...' : 'Crear Producto'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={createProductMutation.isLoading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProductModal;