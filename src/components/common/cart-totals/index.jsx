import React from 'react';

const CartTotals = ({ 
  subtotal = 0, 
  shipping = 0, 
  tax = 0, 
  discount = 0, 
  total = 0,
  currency = '$' 
}) => {
  const formatPrice = (price) => {
    return `${currency}${(price / 100).toFixed(2)}`;
  };

  return (
    <div className="flex flex-col space-y-2 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Subtotal:</span>
        <span className="text-sm font-medium">{formatPrice(subtotal)}</span>
      </div>
      
      {shipping > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Shipping:</span>
          <span className="text-sm font-medium">{formatPrice(shipping)}</span>
        </div>
      )}
      
      {tax > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tax:</span>
          <span className="text-sm font-medium">{formatPrice(tax)}</span>
        </div>
      )}
      
      {discount > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Discount:</span>
          <span className="text-sm font-medium text-green-600">-{formatPrice(discount)}</span>
        </div>
      )}
      
      <div className="border-t pt-2">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-lg font-bold">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartTotals;
