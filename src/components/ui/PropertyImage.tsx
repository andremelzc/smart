'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

interface PropertyImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: ImageProps['priority'];
}

export const PropertyImage = ({ 
  src, 
  alt, 
  className = '', 
  fill = false,
  sizes = '100vw',
  width,
  height,
  priority = false,
}: PropertyImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fallbackSrc = '/placeholder-room.svg';
  const displaySrc = imageError ? fallbackSrc : src;

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-400 text-sm">Cargando...</span>
        </div>
      )}

      <Image
        src={displaySrc}
        alt={alt}
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${fill ? 'absolute inset-0' : ''}`}
        {...(fill
          ? { fill: true as const, sizes }
          : {
              width: width ?? 400,
              height: height ?? 300,
              sizes,
            })}
        priority={priority}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        placeholder="empty"
      />
    </div>
  );
};