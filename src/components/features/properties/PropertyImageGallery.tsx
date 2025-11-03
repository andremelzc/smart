'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PropertyImage {
  url: string;
  alt?: string;
}

interface PropertyImageGalleryProps {
  images: PropertyImage[];
  title?: string;
  className?: string;
}

export function PropertyImageGallery({ 
  images, 
  title = 'Propiedad',
  className = '' 
}: PropertyImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset to first image when images change
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [images]);

  const nextImage = () => {
    if (images && images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (images && images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className={`relative h-96 md:h-[500px] rounded-xl overflow-hidden bg-gray-200 ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-gray-500">No hay imágenes disponibles</span>
        </div>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  return (
    <div className={`relative h-96 md:h-[500px] rounded-xl overflow-hidden bg-gray-200 ${className}`}>
      <img
        src={currentImage?.url || '/placeholder-room.svg'}
        alt={currentImage?.alt || title}
        className="w-full h-full object-cover"
      />
      
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-10 transition-colors"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-10 transition-colors"
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          {/* Image indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}