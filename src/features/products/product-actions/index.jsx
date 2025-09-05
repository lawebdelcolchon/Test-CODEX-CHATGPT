import React, { useState } from 'react';

const ProductActions = ({ 
  product, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onToggleStatus,
  onView,
  compact = false 
}) => {
  const [isLoading, setIsLoading] = useState({});

  const handleAction = async (actionName, actionFn) => {
    if (!actionFn) return;
    
    setIsLoading(prev => ({ ...prev, [actionName]: true }));
    try {
      await actionFn(product);
    } catch (error) {
      console.error(`Error in ${actionName}:`, error);
    } finally {
      setIsLoading(prev => ({ ...prev, [actionName]: false }));
    }
  };

  const isPublished = product.status === 'published';

  if (compact) {
    return (
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handleAction('view', onView)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          title="Ver producto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        
        <button
          onClick={() => handleAction('edit', onEdit)}
          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-full transition-colors"
          title="Editar producto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <button
          onClick={() => handleAction('delete', onDelete)}
          disabled={isLoading.delete}
          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
          title="Eliminar producto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Primary Actions */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => handleAction('edit', onEdit)}
          disabled={isLoading.edit}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors duration-200"
        >
          {isLoading.edit ? 'Cargando...' : 'Editar Producto'}
        </button>

        {onToggleStatus && (
          <button
            onClick={() => handleAction('toggleStatus', onToggleStatus)}
            disabled={isLoading.toggleStatus}
            className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              isPublished
                ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 disabled:bg-yellow-50'
                : 'text-green-700 bg-green-100 hover:bg-green-200 disabled:bg-green-50'
            }`}
          >
            {isLoading.toggleStatus 
              ? 'Cargando...' 
              : isPublished 
                ? 'Despublicar' 
                : 'Publicar'
            }
          </button>
        )}
      </div>

      {/* Secondary Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => handleAction('view', onView)}
          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
        >
          Ver
        </button>

        {onDuplicate && (
          <button
            onClick={() => handleAction('duplicate', onDuplicate)}
            disabled={isLoading.duplicate}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 rounded-md transition-colors duration-200"
          >
            {isLoading.duplicate ? 'Copiando...' : 'Duplicar'}
          </button>
        )}
      </div>

      {/* Danger Zone */}
      <div className="border-t pt-3">
        <button
          onClick={() => handleAction('delete', onDelete)}
          disabled={isLoading.delete}
          className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 disabled:bg-red-50 rounded-md transition-colors duration-200"
        >
          {isLoading.delete ? 'Eliminando...' : 'Eliminar Producto'}
        </button>
      </div>
    </div>
  );
};

export default ProductActions;
