'use client';

import { Button } from '@/src/components/ui/Button';

interface PropertyLoadingStateProps {
  className?: string;
}

export function PropertyLoadingState({ className = '' }: PropertyLoadingStateProps) {
  return (
    <div className={`min-h-screen bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 animate-pulse">
        {/* Basic Info Skeleton */}
        <div className="mb-6 pt-6">
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>

        {/* Gallery Skeleton */}
        <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden bg-gray-200 mb-8"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host Info Skeleton */}
            <div className="flex items-center gap-4 py-6 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-gray-200"></div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>

            {/* Description Skeleton */}
            <div className="space-y-3 py-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>

            {/* Amenities Skeleton */}
            <div className="py-6 border-t border-gray-100">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card Skeleton */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-end mb-6">
                <div className="h-8 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-3 border-r border-gray-200">
                    <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="p-3">
                    <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>

              <div className="h-12 bg-gray-200 rounded-lg w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>
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