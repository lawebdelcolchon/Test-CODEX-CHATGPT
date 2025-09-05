import React, { useState } from 'react';

const ImageGallery = ({ 
  images = [], 
  mainImage,
  alt = "",
  className = "" 
}) => {
  const [selectedImage, setSelectedImage] = useState(mainImage || images[0] || '/api/placeholder/400/400');
  const [loading, setLoading] = useState(false);

  const allImages = mainImage ? [mainImage, ...images.filter(img => img !== mainImage)] : images;

  const handleImageError = (e) => {
    e.target.src = '/api/placeholder/400/400';
  };

  const handleImageChange = (image) => {
    setLoading(true);
    setSelectedImage(image);
    // Simulate loading time
    setTimeout(() => setLoading(false), 200);
  };

  if (allImages.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg overflow-hidden ${className}`}>
        <div className="aspect-square flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-16 w-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Sin imágenes</p>
          </div>
        </div>
      </div>
    );
  }

  if (allImages.length === 1) {
    return (
      <div className={`bg-gray-100 rounded-lg overflow-hidden ${className}`}>
        <div className="aspect-square relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          <img
            src={selectedImage}
            alt={alt}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
            onLoad={() => setLoading(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image */}
      <div className="bg-gray-100 rounded-lg overflow-hidden">
        <div className="aspect-square relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          <img
            src={selectedImage}
            alt={alt}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-zoom-in"
            onError={handleImageError}
            onLoad={() => setLoading(false)}
            onClick={() => {
              // You can implement a zoom/modal functionality here
              console.log('Image clicked for zoom');
            }}
          />
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {allImages.map((image, index) => (
          <button
            key={index}
            onClick={() => handleImageChange(image)}
            className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all duration-200 ${
              selectedImage === image
                ? 'border-blue-600 ring-2 ring-blue-600 ring-opacity-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <img
              src={image}
              alt={`${alt} ${index + 1}`}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </button>
        ))}
      </div>

      {/* Image Counter */}
      <div className="text-center text-sm text-gray-500">
        {allImages.findIndex(img => img === selectedImage) + 1} de {allImages.length}
      </div>
    </div>
  );
};

export default ImageGallery;
