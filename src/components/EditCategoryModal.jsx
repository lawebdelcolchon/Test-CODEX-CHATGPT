import React, { useState, useEffect, useMemo } from 'react';
import { useUpdateCategoryMutation, useCategoriesQuery } from '../hooks/queries/useCategories.js';
import { useAttributesByCategoryQuery } from '../hooks/queries/useAttributes.js';

const EditCategoryModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  category // La categoría que se va a editar
}) => {
  const [formData, setFormData] = useState({
    name: '',
    meta_keywords: '',
    meta_description: '',
    parent: null,
    position: 0,
    visible: true,
    active: true,
    id_attribute_first: null,
    id_attribute_second: null
  });

  const [errors, setErrors] = useState({});

  // Hooks para obtener datos necesarios
  const { 
    data: categoriesResult, 
    isLoading: isCategoriesLoading 
  } = useCategoriesQuery({ page: 1, pageSize: 100 });

  // Obtener atributos de la categoría actual
  const { 
    data: currentCategoryAttributesResult, 
    isLoading: isCurrentCategoryAttributesLoading
  } = useAttributesByCategoryQuery(category?.id, { per_page: 100 });

  // Obtener atributos de la categoría padre (si existe)
  const { 
    data: parentCategoryAttributesResult, 
    isLoading: isParentCategoryAttributesLoading
  } = useAttributesByCategoryQuery(category?.parent, { 
    per_page: 100,
    // Solo hacer la consulta si la categoría tiene padre
    enabled: Boolean(category?.parent)
  });

  const categoriesData = categoriesResult?.items || [];
  const currentCategoryAttributes = currentCategoryAttributesResult?.items || [];
  const parentCategoryAttributes = parentCategoryAttributesResult?.items || [];
  
  // Combinar y filtrar atributos únicos de la categoría actual y su padre
  const availableAttributes = useMemo(() => {
    const allAttributes = [...currentCategoryAttributes, ...parentCategoryAttributes];
    
    // Eliminar duplicados basándose en el ID
    const uniqueAttributes = allAttributes.filter((attr, index, array) => 
      array.findIndex(a => a.id === attr.id) === index
    );
    
    // Ordenar alfabéticamente por nombre
    return uniqueAttributes.sort((a, b) => a.name.localeCompare(b.name));
  }, [currentCategoryAttributes, parentCategoryAttributes]);
  
  const isAttributesLoading = isCurrentCategoryAttributesLoading || isParentCategoryAttributesLoading;

  // Hook para actualizar categoría
  const updateCategoryMutation = useUpdateCategoryMutation({
    onSuccess: (updatedCategory) => {
      console.log('✅ Category updated successfully:', updatedCategory);
      
      // Cerrar modal
      onClose();
      
      // Callback opcional para el componente padre
      if (onSuccess) {
        onSuccess(updatedCategory);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to update category:', error);
      
      // Mostrar errores en el formulario
      if (error.data?.errors) {
        setErrors(error.data.errors);
      } else {
        setErrors({ 
          general: error.message || 'Error al actualizar la categoría' 
        });
      }
    }
  });

  // Inicializar formData cuando se abre el modal o cambia la categoría
  useEffect(() => {
    if (isOpen && category) {
      setFormData({
        name: category.name || '',
        meta_keywords: category.meta_keywords || '',
        meta_description: category.meta_description || '',
        parent: category.parent || null,
        position: category.position || 0,
        visible: Boolean(category.visible),
        active: Boolean(category.active),
        id_attribute_first: category.id_attribute_first || null,
        id_attribute_second: category.id_attribute_second || null
      });
      setErrors({});
    }
  }, [isOpen, category]);

  // Resetear errores y formulario cuando se cierra
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'position' || name === 'parent' || name === 'id_attribute_first' || name === 'id_attribute_second') ? (value === '' ? null : parseInt(value)) : value
    }));

    // Limpiar errores del campo modificado
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
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
      // Limpiar campos vacíos
      meta_keywords: formData.meta_keywords.trim() || null,
      meta_description: formData.meta_description.trim() || null,
    };

    console.log('📝 Submitting category update:', categoryData);
    updateCategoryMutation.mutate({
      id: category.id,
      data: categoryData
    });
  };

  if (!isOpen || !category) return null;

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
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Editar Categoría: {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Modifique los campos que desee actualizar
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
                      value={formData.position || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Orden de la categoría"
                    />
                  </div>

                  {/* Categoría Padre */}
                  <div>
                    <label htmlFor="parent" className="block text-sm font-medium text-gray-700">
                      Categoría Padre
                    </label>
                    <select
                      id="parent"
                      name="parent"
                      value={formData.parent || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Ninguna (Raíz)</option>
                      {categoriesData
                        .filter(cat => cat.id !== category.id)
                        .map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))
                      }
                    </select>
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
                        <label htmlFor="meta_keywords" className="block text-sm font-medium text-gray-700">
                          Meta Keywords
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

                      <div>
                        <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">
                          Meta Descripción
                        </label>
                        <textarea
                          id="meta_description"
                          name="meta_description"
                          rows={3}
                          value={formData.meta_description}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Descripción SEO"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Atributos */}
                  <div>
                    <h4 className="text-md font-medium text-gray-700 border-b pb-2 mb-3">
                      Atributos de Categoría
                    </h4>
                    
                    {isAttributesLoading && (
                      <div className="text-sm text-gray-500">
                        Cargando atributos...
                      </div>
                    )}

                    {!isAttributesLoading && (
                      <div className="space-y-3">
                        {/* Debug info - remover en producción */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                            <p>Categoría actual: {category?.id} ({category?.name})</p>
                            <p>Categoría padre: {category?.parent || 'Ninguna'}</p>
                            <p>Atributos disponibles: {availableAttributes.length}</p>
                            <p>- Categoría actual: {currentCategoryAttributes.length}</p>
                            <p>- Categoría padre: {parentCategoryAttributes.length}</p>
                          </div>
                        )}
                        
                        {/* Información para el usuario */}
                        {availableAttributes.length === 0 && (
                          <div className="text-sm text-gray-500 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p>No hay atributos disponibles para esta categoría.</p>
                            <p>Los atributos deben estar asociados a esta categoría o su categoría padre.</p>
                          </div>
                        )}
                        
                        {availableAttributes.length > 0 && (
                          <div className="text-xs text-gray-500 mb-2">
                            Mostrando atributos de la categoría actual
                            {category?.parent ? ' y su categoría padre' : ''} 
                            ({availableAttributes.length} disponibles)
                          </div>
                        )}
                        
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
                          >
                            <option value="">Ninguno</option>
                            {availableAttributes.map(attr => (
                              <option key={attr.id} value={attr.id}>
                                {attr.name} {attr.utilities ? `(${attr.utilities})` : ''}
                              </option>
                            ))}
                          </select>
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
                          >
                            <option value="">Ninguno</option>
                            {availableAttributes.map(attr => (
                              <option key={attr.id} value={attr.id}>
                                {attr.name} {attr.utilities ? `(${attr.utilities})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={updateCategoryMutation.isLoading}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                  updateCategoryMutation.isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {updateCategoryMutation.isLoading ? 'Actualizando...' : 'Actualizar Categoría'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={updateCategoryMutation.isLoading}
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

export default EditCategoryModal;
