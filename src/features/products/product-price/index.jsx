import React from 'react';

const ProductPrice = ({ 
  price, 
  compareAtPrice, 
  costPrice, 
  currency = '$', 
  showCostPrice = false,
  size = 'medium',
  className = '' 
}) => {
  const formatPrice = (price) => {
    if (price === null || price === undefined) return '';
    return `${currency}${(price / 100).toFixed(2)}`;
  };

  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercentage = hasDiscount 
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) 
    : 0;

  const sizeClasses = {
    small: {
      price: 'text-lg font-bold',
      comparePrice: 'text-sm',
      costPrice: 'text-xs',
      discount: 'text-xs'
    },
    medium: {
      price: 'text-xl font-bold',
      comparePrice: 'text-base',
      costPrice: 'text-sm',
      discount: 'text-sm'
    },
    large: {
      price: 'text-2xl font-bold',
      comparePrice: 'text-lg',
      costPrice: 'text-base',
      discount: 'text-base'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Current Price */}
      <span className={`text-gray-900 ${classes.price}`}>
        {formatPrice(price)}
      </span>

      {/* Compare At Price */}
      {hasDiscount && (
        <span className={`text-gray-500 line-through ${classes.comparePrice}`}>
          {formatPrice(compareAtPrice)}
        </span>
      )}

      {/* Discount Badge */}
      {hasDiscount && (
        <span className={`bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium ${classes.discount}`}>
          -{discountPercentage}%
        </span>
      )}

      {/* Cost Price (for admin view) */}
      {showCostPrice && costPrice && (
        <div className="text-gray-600">
          <span className={`${classes.costPrice}`}>
            Costo: {formatPrice(costPrice)}
          </span>
          {price && costPrice && (
            <span className={`ml-2 ${classes.costPrice} text-green-600 font-medium`}>
              Margen: {Math.round(((price - costPrice) / price) * 100)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductPrice;
