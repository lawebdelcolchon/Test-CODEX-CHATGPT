import React from 'react';

const Checkbox = ({ 
  id,
  checked = false, 
  onChange, 
  label, 
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
        {...props}
      />
      {label && (
        <label 
          htmlFor={id} 
          className={`text-sm font-medium text-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
