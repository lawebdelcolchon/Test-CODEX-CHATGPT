import React from 'react';

const SkeletonButton = ({ 
  width = 'w-24', 
  height = 'h-10', 
  rounded = 'rounded-md',
  className = '' 
}) => {
  return (
    <div className={`
      ${width} ${height} ${rounded} bg-gray-200 animate-pulse ${className}
    `}></div>
  );
};

export default SkeletonButton;
