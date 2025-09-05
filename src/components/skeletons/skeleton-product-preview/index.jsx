import React from 'react';

const SkeletonProductPreview = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Product Image */}
      <div className="h-64 bg-gray-200 animate-pulse"></div>
      
      {/* Product Details */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
        </div>
        
        {/* Price */}
        <div className="flex items-center space-x-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
        </div>
        
        {/* Category and Stock */}
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
        </div>
        
        {/* Action Button */}
        <div className="pt-3">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonProductPreview;
