'use client';

import { useState } from 'react';

interface PropertyImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
}

export const PropertyImage = ({ 
  src, 
  alt, 
  className = '', 
  fill = false
}: PropertyImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fallbackSrc = '/placeholder-room.svg';

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-400 text-sm">Cargando...</span>
        </div>
      )}
      
      <img
        src={imageError ? fallbackSrc : src}
        alt={alt}
        className={`${fill ? 'absolute inset-0 w-full h-full' : ''} object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
};