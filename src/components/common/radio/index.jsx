import React from 'react';

const Radio = ({ 
  id,
  name,
  value,
  checked = false, 
  onChange, 
  label, 
  disabled = false,
  className = '',
  description,
  ...props 
}) => {
  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:opacity-50 mt-0.5"
        {...props}
      />
      <div className="flex-1">
        {label && (
          <label 
            htmlFor={id} 
            className={`text-sm font-medium text-gray-700 ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {label}
          </label>
        )}
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

const RadioGroup = ({ 
  options = [], 
  value, 
  onChange, 
  name,
  label,
  error,
  helperText,
  required = false,
  className = '',
  orientation = 'vertical' // 'vertical' or 'horizontal'
}) => {
  const handleChange = (selectedValue) => {
    if (onChange) {
      onChange(selectedValue);
    }
  };

  return (
    <div className={className}>
      {label && (
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </legend>
      )}
      
      <div className={`space-${orientation === 'horizontal' ? 'x' : 'y'}-3 ${
        orientation === 'horizontal' ? 'flex flex-wrap' : ''
      }`}>
        {options.map((option, index) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          const optionDescription = typeof option === 'object' ? option.description : undefined;
          const optionDisabled = typeof option === 'object' ? option.disabled : false;
          
          return (
            <Radio
              key={optionValue}
              id={`${name}-${index}`}
              name={name}
              value={optionValue}
              checked={value === optionValue}
              onChange={() => handleChange(optionValue)}
              label={optionLabel}
              description={optionDescription}
              disabled={optionDisabled}
            />
          );
        })}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-2">{helperText}</p>
      )}
    </div>
  );
};

// Export both Radio and RadioGroup
Radio.Group = RadioGroup;

export default Radio;
