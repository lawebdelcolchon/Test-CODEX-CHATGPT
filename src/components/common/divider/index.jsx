import React from 'react';

const Divider = ({ 
  orientation = 'horizontal', 
  className = '', 
  label,
  labelPosition = 'center' 
}) => {
  if (orientation === 'vertical') {
    return (
      <div className={`inline-block h-full w-px bg-gray-300 ${className}`}></div>
    );
  }

  if (label) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className={`relative flex ${
          labelPosition === 'left' ? 'justify-start' : 
          labelPosition === 'right' ? 'justify-end' : 
          'justify-center'
        }`}>
          <span className="bg-white px-2 text-sm text-gray-500">{label}</span>
        </div>
      </div>
    );
  }

  return (
    <hr className={`border-gray-300 ${className}`} />
  );
};

export default Divider;
