'use client';

import { Button } from '@/src/components/ui/Button';

interface PropertyLoadingStateProps {
  className?: string;
}

export function PropertyLoadingState({ className = '' }: PropertyLoadingStateProps) {
  return (
    <div className={`min-h-screen bg-white ${className}`}>
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="h-8 bg-gray-200 rounded mb-4 mx-4"></div>
        
        {/* Image gallery skeleton */}
        <div className="h-96 bg-gray-200 rounded-lg mx-4 mb-6"></div>
        
        {/* Content skeleton */}
        <div className="mx-4 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}

interface PropertyErrorStateProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export function PropertyErrorState({ 
  error, 
  onRetry,
  className = '' 
}: PropertyErrorStateProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className={`min-h-screen bg-white flex items-center justify-center ${className}`}>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Error al cargar la propiedad
        </h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={handleRetry}>
          Intentar de nuevo
        </Button>
      </div>
    </div>
  );
}

interface PropertyNotFoundStateProps {
  className?: string;
}

export function PropertyNotFoundState({ className = '' }: PropertyNotFoundStateProps) {
  return (
    <div className={`min-h-screen bg-white flex items-center justify-center ${className}`}>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Propiedad no encontrada
        </h1>
        <p className="text-gray-600">
          La propiedad que buscas no existe o ha sido eliminada.
        </p>
      </div>
    </div>
  );
}