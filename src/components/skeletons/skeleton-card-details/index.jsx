import React from 'react';

const SkeletonCardDetails = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 space-y-4 ${className}`}>
      {/* Header */}
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
      </div>
      
      {/* Content */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
      </div>
      
      {/* Actions */}
      <div className="flex space-x-2 pt-4">
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
};

export default SkeletonCardDetails;
