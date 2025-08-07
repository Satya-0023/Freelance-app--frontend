import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const fallbackImage = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg';
  const displayImages = images && images.length > 0 ? images : [fallbackImage];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = fallbackImage;
  };

  if (displayImages.length === 0) {
    return (
      <div className="w-full h-56 bg-gray-100 rounded-xl flex items-center justify-center">
        <img 
          src={fallbackImage} 
          alt={title} 
          className="object-cover w-full h-full rounded-xl"
          onError={handleImageError}
        />
      </div>
    );
  }

  return (
    <>
      {/* Main Image */}
      <div className="relative w-full h-56 bg-gray-100 rounded-xl overflow-hidden">
        <img
          src={displayImages[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          className="object-cover w-full h-full cursor-pointer"
          onClick={() => setShowModal(true)}
          onError={handleImageError}
        />
        
        {/* Navigation arrows for multiple images */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            
            {/* Image counter */}
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {currentIndex + 1} / {displayImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip for multiple images */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentIndex ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              <img
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                className="object-cover w-full h-full"
                onError={handleImageError}
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal for full-size image */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="relative">
              <img
                src={displayImages[currentIndex]}
                alt={`${title} - Full size`}
                className="max-w-full max-h-[80vh] object-contain"
                onError={handleImageError}
              />
              
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery; 