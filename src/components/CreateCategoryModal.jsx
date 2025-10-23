import React, { useState, useEffect } from 'react';
import { useCreateCategoryMutation, useActiveCategoriesQuery } from '../hooks/queries/useCategories.js';
import { useActiveAttributesQuery, useAttributesByCategoryQuery } from '../hooks/queries/useAttributes.js';

const CreateCategoryModal = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true,
    visible: true,
    position: '',
    parent_id: null,
    // Campos de atributos específicos
    id_attribute_first: null,
    id_attribute_second: null,
    // Campos SEO
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });

  const [errors, setErrors] = useState({});

  // Hooks para la API
  const createCategoryMutation = useCreateCategoryMutation({
    onSuccess: (newCategory) => {
      console.log('✅ Category created successfully:', newCategory);
      
      // Limpiar formulario
      resetForm();
      
      // Cerrar modal
      onClose();
      
      // Callback opcional para el componente padre
      if (onSuccess) {
        onSuccess(newCategory);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to create category:', error);
      
      // Mostrar errores en el formulario
      if (error.data?.errors) {
        setErrors(error.data.errors);
      } else {
        setErrors({ 
          general: error.message || 'Error al crear la categoría' 
        });
      }
    }
  });

  // Hook para obtener categorías activas (para selector de padre)
  const { 
    data: categoriesData, 
    isLoading: categoriesLoading,
    error: categoriesError 
  } = useActiveCategoriesQuery({ 
    per_page: 100 // Obtener muchas categorías para el selector
  });

  const availableParentCategories = categoriesData?.items || [];

  // Hook para obtener atributos relacionados con la categoría padre seleccionada
  const { 
    data: attributesByCategoryData, 
    isLoading: attributesByCategoryLoading,
    error: attributesByCategoryError 
  } = useAttributesByCategoryQuery(
    formData.parent_id, 
    { per_page: 100 },
    { 
      enabled: !!formData.parent_id // Solo ejecutar si hay categoría padre seleccionada
    }
  );

  // Hook para obtener atributos activos (fallback si no hay categoría padre)
  const { 
    data: allAttributesData, 
    isLoading: allAttributesLoading,
    error: allAttributesError 
  } = useActiveAttributesQuery(
    { per_page: 100 },
    { 
      enabled: !formData.parent_id // Solo ejecutar si NO hay categoría padre seleccionada
    }
  );

  // Determinar qué atributos mostrar
  const attributesFromParent = attributesByCategoryData?.items || [];
  const allAttributes = allAttributesData?.items || [];
  const availableAttributes = formData.parent_id ? attributesFromParent : allAttributes;
  
  const attributesLoading = formData.parent_id ? attributesByCategoryLoading : allAttributesLoading;
  const attributesError = formData.parent_id ? attributesByCategoryError : allAttributesError;

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      active: true,
      visible: true,
      position: '',
      parent_id: null,
      id_attribute_first: null,
      id_attribute_second: null,
      meta_title: '',
      meta_description: '',
      meta_keywords: ''
    });
    setErrors({});
  };

  // Reset form cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Limpiar atributos específicos cuando cambia la categoría padre
  useEffect(() => {
    if (formData.parent_id) {
      // Limpiar atributos específicos cuando se selecciona/cambia la categoría padre
      // para que el usuario elija nuevamente
      setFormData(prev => ({
        ...prev,
        id_attribute_first: null,
        id_attribute_second: null
      }));
    }
  }, [formData.parent_id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    
    // Validaciones básicas
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Preparar datos para envío
    const categoryData = {
      ...formData,
      position: formData.position ? parseInt(formData.position) : null,
      parent_id: formData.parent_id || null,
      // Usar los valores seleccionados de atributos específicos
      id_attribute_first: formData.id_attribute_first || null,
      id_attribute_second: formData.id_attribute_second || null,
      // Limpiar campos vacíos
      description: formData.description.trim() || null,
      meta_title: formData.meta_title.trim() || null,
      meta_description: formData.meta_description.trim() || null,
      meta_keywords: formData.meta_keywords.trim() || null,
    };

    console.log('📝 Submitting category data:', categoryData);
    createCategoryMutation.mutate(categoryData);
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

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              {/* Header */}
              <div className="sm:flex sm:items-start mb-6">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Crear Nueva Categoría
                  </h3>
                  <p className="text-sm text-gray-500">
                    Complete los campos para crear una nueva categoría
                  </p>
                </div>
              </div>

              {/* Error general */}
              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna izquierda - Datos básicos */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700 border-b pb-2">
                    Información Básica
                  </h4>

                  {/* Nombre */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.name 
                          ? 'border-red-300 text-red-900 placeholder-red-300' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Nombre de la categoría"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Descripción */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Descripción de la categoría"
                    />
                  </div>

                  {/* Posición */}
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                      Posición
                    </label>
                    <input
                      type="number"
                      id="position"
                      name="position"
                      min="0"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Orden de la categoría"
                    />
                  </div>

                  {/* Categoría Padre */}
                  <div>
                    <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700">
                      Categoría Padre
                    </label>
                    <select
                      id="parent_id"
                      name="parent_id"
                      value={formData.parent_id || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Sin categoría padre</option>
                      {categoriesLoading && (
                        <option disabled>Cargando categorías...</option>
                      )}
                      {!categoriesLoading && availableParentCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {categoriesError && (
                      <p className="mt-1 text-xs text-red-600">
                        Error al cargar categorías padre
                      </p>
                    )}
                  </div>

                  {/* Atributo Primario */}
                  <div>
                    <label htmlFor="id_attribute_first" className="block text-sm font-medium text-gray-700">
                      Atributo Primario
                    </label>
                    <select
                      id="id_attribute_first"
                      name="id_attribute_first"
                      value={formData.id_attribute_first || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={!formData.parent_id}
                    >
                      <option value="">Sin atributo primario</option>
                      {availableAttributes.map((attribute) => (
                        <option key={attribute.id} value={attribute.id}>
                          {attribute.name}
                          {attribute.utilities && ` (${attribute.utilities})`}
                        </option>
                      ))}
                    </select>
                    {!formData.parent_id && (
                      <p className="mt-1 text-xs text-gray-500">
                        Selecciona una categoría padre para elegir atributos
                      </p>
                    )}
                  </div>

                  {/* Atributo Secundario */}
                  <div>
                    <label htmlFor="id_attribute_second" className="block text-sm font-medium text-gray-700">
                      Atributo Secundario
                    </label>
                    <select
                      id="id_attribute_second"
                      name="id_attribute_second"
                      value={formData.id_attribute_second || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={!formData.parent_id}
                    >
                      <option value="">Sin atributo secundario</option>
                      {availableAttributes.map((attribute) => (
                        <option key={attribute.id} value={attribute.id}>
                          {attribute.name}
                          {attribute.utilities && ` (${attribute.utilities})`}
                        </option>
                      ))}
                    </select>
                    {!formData.parent_id && (
                      <p className="mt-1 text-xs text-gray-500">
                        Selecciona una categoría padre para elegir atributos
                      </p>
                    )}
                  </div>

                  {/* Estados */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        id="active"
                        name="active"
                        type="checkbox"
                        checked={formData.active}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                        Activa
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="visible"
                        name="visible"
                        type="checkbox"
                        checked={formData.visible}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="visible" className="ml-2 block text-sm text-gray-700">
                        Visible
                      </label>
                    </div>
                  </div>
                </div>

                {/* Columna derecha - SEO y Atributos */}
                <div className="space-y-4">
                  {/* SEO */}
                  <div>
                    <h4 className="text-md font-medium text-gray-700 border-b pb-2 mb-3">
                      SEO
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700">
                          Meta Título
                        </label>
                        <input
                          type="text"
                          id="meta_title"
                          name="meta_title"
                          value={formData.meta_title}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Título SEO"
                        />
                      </div>

                      <div>
                        <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">
                          Meta Descripción
                        </label>
                        <textarea
                          id="meta_description"
                          name="meta_description"
                          rows={2}
                          value={formData.meta_description}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Descripción SEO"
                        />
                      </div>

                      <div>
                        <label htmlFor="meta_keywords" className="block text-sm font-medium text-gray-700">
                          Palabras Clave
                        </label>
                        <input
                          type="text"
                          id="meta_keywords"
                          name="meta_keywords"
                          value={formData.meta_keywords}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="palabra1, palabra2, palabra3"
                        />
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
                disabled={createCategoryMutation.isLoading}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm ${
                  createCategoryMutation.isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {createCategoryMutation.isLoading ? 'Creando...' : 'Crear Categoría'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={createCategoryMutation.isLoading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default CreateCategoryModal;
