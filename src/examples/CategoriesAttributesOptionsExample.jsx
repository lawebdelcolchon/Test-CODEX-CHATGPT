import React, { useState } from 'react';
import { useGenericCRUD } from '../hooks/useGenericCRUD';

/**
 * Ejemplo completo usando categories, attributes y options
 * con el sistema genérico de CRUD
 */
const CategoriesAttributesOptionsExample = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // ===== HOOKS GENÉRICOS PARA CADA MODELO =====
  
  const categories = useGenericCRUD('categories', {
    autoFetch: true,
    fetchParams: { page: 1, pageSize: 15 },
    onSuccess: (operation, result) => {
      console.log(`✅ Categories ${operation} successful:`, result);
    }
  });

  const attributes = useGenericCRUD('attributes', {
    autoFetch: activeTab === 'attributes',
    fetchParams: { page: 1, pageSize: 15 },
    onSuccess: (operation, result) => {
      console.log(`✅ Attributes ${operation} successful:`, result);
    }
  });

  const options = useGenericCRUD('options', {
    autoFetch: activeTab === 'options',
    fetchParams: { page: 1, pageSize: 15 },
    onSuccess: (operation, result) => {
      console.log(`✅ Options ${operation} successful:`, result);
    }
  });

  // ===== FUNCIÓN PARA OBTENER EL CRUD ACTIVO =====
  const getActiveCRUD = () => {
    switch (activeTab) {
      case 'categories': return categories;
      case 'attributes': return attributes;
      case 'options': return options;
      default: return categories;
    }
  };

  const activeCRUD = getActiveCRUD();

  // ===== HANDLERS =====

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setShowCreateForm(false);
    setEditingItem(null);
    
    // Auto-fetch data for new tab if not loaded
    if (newTab === 'attributes' && attributes.data.items.length === 0) {
      attributes.actions.fetchList();
    }
    if (newTab === 'options' && options.data.items.length === 0) {
      options.actions.fetchList();
    }
  };

  const handleCreate = async (formData) => {
    try {
      await activeCRUD.actions.create(formData);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await activeCRUD.actions.update(editingItem.id, formData);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      try {
        await activeCRUD.actions.remove(id);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleToggleActive = async (item) => {
    const action = item.active ? 'deactivate' : 'activate';
    try {
      await activeCRUD.actions.customAction(action, item.id, null, 'POST');
      // Refresh data after custom action
      activeCRUD.actions.refetch();
    } catch (error) {
      console.error(`Error ${action} item:`, error);
    }
  };

  // ===== RENDER =====

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Gestión de Categorías, Atributos y Opciones
      </h1>

      {/* TABS */}
      <div className="flex space-x-1 mb-6">
        {[
          { key: 'categories', label: 'Categorías', count: categories.data.total },
          { key: 'attributes', label: 'Atributos', count: attributes.data.total },
          { key: 'options', label: 'Opciones', count: options.data.total }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeTab === tab.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-white bg-opacity-20 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ERRORES */}
      {activeCRUD.errors.hasError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {activeCRUD.errors.listError || activeCRUD.errors.error}
          <button 
            onClick={activeCRUD.utils.clearErrors}
            className="ml-2 underline"
          >
            Limpiar
          </button>
        </div>
      )}

      {/* BARRA DE HERRAMIENTAS */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">
            {activeCRUD.loading.isListLoading 
              ? 'Cargando...' 
              : `${activeCRUD.data.total} elementos encontrados`
            }
          </span>
        </div>

        {activeCRUD.utils.canCreate && (
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={activeCRUD.loading.isAnyLoading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            Crear {activeTab === 'categories' ? 'Categoría' : 
                   activeTab === 'attributes' ? 'Atributo' : 'Opción'}
          </button>
        )}
      </div>

      {/* LISTA VACÍA */}
      {activeCRUD.data.isEmpty && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay {activeTab} disponibles</p>
          {activeCRUD.utils.canCreate && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
            >
              Crear el primer elemento
            </button>
          )}
        </div>
      )}

      {/* TABLA DE DATOS */}
      {!activeCRUD.data.isEmpty && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nombre
                </th>
                {activeTab === 'categories' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Parent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Posición
                    </th>
                  </>
                )}
                {activeTab === 'attributes' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Utilidades
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nivel
                    </th>
                  </>
                )}
                {activeTab === 'options' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Utilidades
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Posición
                    </th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activeCRUD.data.items.map((item) => (
                <tr key={item.id} className={activeCRUD.loading.isAnyLoading ? 'opacity-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>
                  </td>
                  
                  {/* Campos específicos por tipo */}
                  {activeTab === 'categories' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.parent || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.position}
                      </td>
                    </>
                  )}
                  {activeTab === 'attributes' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="truncate max-w-xs" title={item.utilities}>
                          {item.utilities}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.level}
                      </td>
                    </>
                  )}
                  {activeTab === 'options' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="truncate max-w-xs" title={item.utilities}>
                          {item.utilities}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.position}
                      </td>
                    </>
                  )}

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {/* Toggle Active */}
                      <button
                        onClick={() => handleToggleActive(item)}
                        disabled={activeCRUD.loading.isCustomActionLoading}
                        className={`px-2 py-1 text-xs rounded ${
                          item.active
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        } disabled:opacity-50`}
                      >
                        {item.active ? 'Desactivar' : 'Activar'}
                      </button>

                      {/* Editar */}
                      {activeCRUD.utils.canUpdate && (
                        <button
                          onClick={() => setEditingItem(item)}
                          disabled={activeCRUD.loading.isAnyLoading}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:opacity-50"
                        >
                          Editar
                        </button>
                      )}

                      {/* Eliminar */}
                      {activeCRUD.utils.canDelete && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={activeCRUD.loading.isDeleteLoading}
                          className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINACIÓN */}
      {activeCRUD.data.pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => activeCRUD.actions.fetchList({
              page: activeCRUD.data.pagination.page - 1
            })}
            disabled={activeCRUD.data.pagination.page <= 1 || activeCRUD.loading.isListLoading}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          
          <span className="px-3 py-1 bg-gray-100 rounded">
            Página {activeCRUD.data.pagination.page} de {activeCRUD.data.pagination.totalPages}
          </span>
          
          <button
            onClick={() => activeCRUD.actions.fetchList({
              page: activeCRUD.data.pagination.page + 1
            })}
            disabled={activeCRUD.data.pagination.page >= activeCRUD.data.pagination.totalPages || activeCRUD.loading.isListLoading}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* MODAL DE CREAR */}
      {showCreateForm && (
        <GenericForm
          title={`Crear ${activeTab === 'categories' ? 'Categoría' : 
                       activeTab === 'attributes' ? 'Atributo' : 'Opción'}`}
          modelType={activeTab}
          onSubmit={handleCreate}
          onCancel={() => setShowCreateForm(false)}
          loading={activeCRUD.loading.isCreateLoading}
          error={activeCRUD.errors.createError}
        />
      )}

      {/* MODAL DE EDITAR */}
      {editingItem && (
        <GenericForm
          title={`Editar ${activeTab === 'categories' ? 'Categoría' : 
                        activeTab === 'attributes' ? 'Atributo' : 'Opción'}`}
          modelType={activeTab}
          initialData={editingItem}
          onSubmit={handleUpdate}
          onCancel={() => setEditingItem(null)}
          loading={activeCRUD.loading.isUpdateLoading}
          error={activeCRUD.errors.updateError}
        />
      )}
    </div>
  );
};

// ===== COMPONENTE DE FORMULARIO GENÉRICO =====
const GenericForm = ({ 
  title, 
  modelType, 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  loading, 
  error 
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    active: initialData.active !== undefined ? initialData.active : true,
    // Campos específicos
    ...(modelType === 'categories' && {
      parent: initialData.parent || '',
      position: initialData.position || 0,
      visible: initialData.visible !== undefined ? initialData.visible : true,
      meta_keywords: initialData.meta_keywords || '',
      meta_description: initialData.meta_description || ''
    }),
    ...(modelType === 'attributes' && {
      utilities: initialData.utilities || '',
      caption: initialData.caption || '',
      level: initialData.level || 0,
      parent: initialData.parent || '',
      id_category: initialData.id_category || '',
      visible: initialData.visible !== undefined ? initialData.visible : true
    }),
    ...(modelType === 'options' && {
      utilities: initialData.utilities || '',
      caption: initialData.caption || '',
      observations: initialData.observations || '',
      position: initialData.position || 0,
      id_category: initialData.id_category || ''
    })
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre - campo universal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          {/* Campos específicos por modelo */}
          {modelType === 'categories' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent ID
                </label>
                <input
                  type="number"
                  value={formData.parent}
                  onChange={(e) => handleChange('parent', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posición
                </label>
                <input
                  type="number"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  value={formData.meta_keywords}
                  onChange={(e) => handleChange('meta_keywords', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => handleChange('meta_description', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </>
          )}

          {(modelType === 'attributes' || modelType === 'options') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Utilidades *
                </label>
                <input
                  type="text"
                  required
                  value={formData.utilities}
                  onChange={(e) => handleChange('utilities', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption
                </label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) => handleChange('caption', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </>
          )}

          {modelType === 'attributes' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel
                </label>
                <input
                  type="number"
                  value={formData.level}
                  onChange={(e) => handleChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent ID
                </label>
                <input
                  type="number"
                  value={formData.parent}
                  onChange={(e) => handleChange('parent', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </>
          )}

          {modelType === 'options' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => handleChange('observations', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posición
                </label>
                <input
                  type="number"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </>
          )}

          {/* Campos universales */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleChange('active', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Activo</span>
            </label>
          </div>

          {(modelType === 'categories' || modelType === 'attributes') && (
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.visible}
                  onChange={(e) => handleChange('visible', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Visible</span>
              </label>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoriesAttributesOptionsExample;
