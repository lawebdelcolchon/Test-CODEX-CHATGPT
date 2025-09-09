import React, { useState } from 'react';
import { useGenericCRUD } from '../hooks/useGenericCRUD';

/**
 * Ejemplo de componente usando el sistema genérico de CRUD
 * Este ejemplo muestra cómo usar el hook useGenericCRUD para manejar productos
 */
const ProductsExample = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ===== USAR EL HOOK GENÉRICO =====
  const {
    data: { items: products, total, pagination, isEmpty },
    loading: { 
      isListLoading, 
      isCreateLoading, 
      isUpdateLoading, 
      isDeleteLoading,
      isAnyLoading 
    },
    errors: { 
      listError, 
      createError, 
      updateError, 
      deleteError, 
      hasError 
    },
    actions: { 
      fetchList, 
      create, 
      update, 
      remove, 
      customAction,
      refetch 
    },
    filters: { setFilters, currentFilters },
    utils: { clearErrors, canCreate, canUpdate, canDelete }
  } = useGenericCRUD('products', {
    autoFetch: true,
    fetchParams: { page: 1, pageSize: 10 },
    enableOptimisticUpdates: true,
    onError: (operation, error) => {
      console.error(`❌ Error en ${operation}:`, error);
      // Aquí podrías mostrar toast, notification, etc.
    },
    onSuccess: (operation, result) => {
      console.log(`✅ Éxito en ${operation}:`, result);
      if (operation === 'create') {
        setShowCreateForm(false);
      }
      if (operation === 'update') {
        setEditingProduct(null);
      }
    }
  });

  // ===== HANDLERS =====

  const handleSearch = (e) => {
    e.preventDefault();
    const filters = searchTerm ? { q: searchTerm } : {};
    setFilters(filters);
    fetchList({ ...filters, page: 1 });
  };

  const handleCreateProduct = async (productData) => {
    try {
      await create(productData);
    } catch (error) {
      // Error handling ya se hace en onError callback
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      await update(editingProduct.id, productData);
    } catch (error) {
      // Error handling ya se hace en onError callback
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await remove(productId);
      } catch (error) {
        // Error handling ya se hace en onError callback
      }
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await update(product.id, { ...product, active: !product.active });
    } catch (error) {
      // Error handling ya se hace en onError callback
    }
  };

  const handlePageChange = (page) => {
    fetchList({ 
      ...currentFilters, 
      page, 
      pageSize: pagination.pageSize 
    });
  };

  const handleDuplicateProduct = async (product) => {
    try {
      await customAction('duplicate', product.id, null, 'POST');
      refetch(); // Recargar lista después de la acción personalizada
    } catch (error) {
      console.error('Error duplicating product:', error);
    }
  };

  // ===== RENDER =====

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Productos (Sistema Genérico)</h1>

      {/* ERROR GLOBAL */}
      {hasError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error: </strong>
          {listError || createError || updateError || deleteError}
          <button 
            onClick={clearErrors}
            className="ml-2 underline"
          >
            Limpiar errores
          </button>
        </div>
      )}

      {/* BARRA DE HERRAMIENTAS */}
      <div className="flex justify-between items-center mb-6">
        {/* BÚSQUEDA */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded"
          />
          <button 
            type="submit"
            disabled={isListLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {isListLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {/* BOTÓN CREAR */}
        {canCreate && (
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={isAnyLoading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            Crear Producto
          </button>
        )}
      </div>

      {/* INFORMACIÓN DE PAGINACIÓN */}
      <div className="mb-4 text-gray-600">
        {isListLoading ? 'Cargando...' : `${total} productos encontrados`}
      </div>

      {/* LISTA VACÍA */}
      {isEmpty && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay productos disponibles</p>
          {canCreate && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
            >
              Crear el primer producto
            </button>
          )}
        </div>
      )}

      {/* TABLA DE PRODUCTOS */}
      {!isEmpty && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className={isAnyLoading ? 'opacity-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${product.price}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.stock || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {/* Toggle Active */}
                        <button
                          onClick={() => handleToggleActive(product)}
                          disabled={isUpdateLoading}
                          className={`px-2 py-1 text-xs rounded ${
                            product.active
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          } disabled:opacity-50`}
                        >
                          {product.active ? 'Desactivar' : 'Activar'}
                        </button>

                        {/* Editar */}
                        {canUpdate && (
                          <button
                            onClick={() => setEditingProduct(product)}
                            disabled={isAnyLoading}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:opacity-50"
                          >
                            Editar
                          </button>
                        )}

                        {/* Duplicar */}
                        <button
                          onClick={() => handleDuplicateProduct(product)}
                          disabled={isAnyLoading}
                          className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200 disabled:opacity-50"
                        >
                          Duplicar
                        </button>

                        {/* Eliminar */}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={isDeleteLoading}
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

          {/* PAGINACIÓN */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || isListLoading}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                Anterior
              </button>
              
              <span className="px-3 py-1 bg-gray-100 rounded">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || isListLoading}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* MODAL DE CREAR */}
      {showCreateForm && (
        <ProductForm
          title="Crear Producto"
          onSubmit={handleCreateProduct}
          onCancel={() => setShowCreateForm(false)}
          loading={isCreateLoading}
          error={createError}
        />
      )}

      {/* MODAL DE EDITAR */}
      {editingProduct && (
        <ProductForm
          title="Editar Producto"
          initialData={editingProduct}
          onSubmit={handleUpdateProduct}
          onCancel={() => setEditingProduct(null)}
          loading={isUpdateLoading}
          error={updateError}
        />
      )}
    </div>
  );
};

// ===== COMPONENTE DE FORMULARIO =====
const ProductForm = ({ title, initialData = {}, onSubmit, onCancel, loading, error }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    price: initialData.price || '',
    stock: initialData.stock || '',
    active: initialData.active !== undefined ? initialData.active : true,
    description: initialData.description || ''
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
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => handleChange('stock', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleChange('active', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Producto activo</span>
            </label>
          </div>

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

export default ProductsExample;
