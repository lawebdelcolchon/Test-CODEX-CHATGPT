import React from 'react';

const ProductPreview = ({ product, onEdit, onDelete, onView }) => {
  const formatPrice = (price) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { color: 'text-red-600', label: 'Sin stock' };
    if (quantity < 10) return { color: 'text-yellow-600', label: 'Stock bajo' };
    return { color: 'text-green-600', label: 'En stock' };
  };

  const stockStatus = getStockStatus(product.inventory_quantity);

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 overflow-hidden">
        <img
          src={product.thumbnail || '/api/placeholder/300/300'}
          alt={product.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            e.target.src = '/api/placeholder/300/300';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Title and Status */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
            {product.title}
          </h3>
          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
            {product.status === 'published' ? 'Publicado' : 
             product.status === 'draft' ? 'Borrador' : 
             'Archivado'}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>

        {/* Category and SKU */}
        <div className="text-sm text-gray-600 mb-3">
          <div className="flex justify-between">
            <span><strong>Categoría:</strong> {product.category || 'Sin categoría'}</span>
            <span><strong>SKU:</strong> {product.sku}</span>
          </div>
        </div>

        {/* Stock Status */}
        <div className="flex justify-between items-center mb-4">
          <span className={`text-sm font-medium ${stockStatus.color}`}>
            {stockStatus.label}
          </span>
          <span className="text-sm text-gray-600">
            {product.inventory_quantity} unidades
          </span>
        </div>

        {/* Variants */}
        {product.variants > 1 && (
          <div className="text-sm text-gray-600 mb-4">
            <span>{product.variants} variantes disponibles</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => onView?.(product)}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
          >
            Ver
          </button>
          <button
            onClick={() => onEdit?.(product)}
            className="flex-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors duration-200"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete?.(product)}
            className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors duration-200"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
