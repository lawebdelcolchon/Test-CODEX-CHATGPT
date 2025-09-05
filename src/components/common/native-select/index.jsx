import React, { forwardRef } from 'react';

const NativeSelect = forwardRef(({ 
  options = [], 
  label, 
  error, 
  helperText,
  required = false,
  placeholder = "Seleccionar...",
  className = '',
  containerClassName = '',
  ...props 
}, ref) => {
  const hasError = !!error;
  
  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        ref={ref}
        className={`
          block w-full rounded-md border-0 py-2 px-3 text-gray-900 
          ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset 
          focus:ring-blue-600 sm:text-sm sm:leading-6
          ${hasError ? 'ring-red-500 focus:ring-red-500' : ''}
          ${props.disabled ? 'bg-gray-50 cursor-not-allowed opacity-50' : ''}
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => {
          // Support both string array and object array
          const value = typeof option === 'string' ? option : option.value;
          const label = typeof option === 'string' ? option : option.label;
          const disabled = typeof option === 'object' ? option.disabled : false;
          
          return (
            <option key={value} value={value} disabled={disabled}>
              {label}
            </option>
          );
        })}
      </select>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

NativeSelect.displayName = 'NativeSelect';

export default NativeSelect;
