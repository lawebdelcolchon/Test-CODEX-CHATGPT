import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  helperText,
  required = false,
  className = '', 
  containerClassName = '',
  startIcon,
  endIcon,
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
      
      <div className="relative">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {startIcon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          className={`
            block w-full rounded-md border-0 py-2 px-3 text-gray-900 
            ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
            focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6
            ${hasError ? 'ring-red-500 focus:ring-red-500' : ''}
            ${startIcon ? 'pl-10' : ''}
            ${endIcon ? 'pr-10' : ''}
            ${props.disabled ? 'bg-gray-50 cursor-not-allowed opacity-50' : ''}
            ${className}
          `}
          {...props}
        />
        
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {endIcon}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
