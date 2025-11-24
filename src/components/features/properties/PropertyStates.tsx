"use client";

import { Button } from "@/src/components/ui/Button";

interface PropertyLoadingStateProps {
  className?: string;
}

export function PropertyLoadingState({
  className = "",
}: PropertyLoadingStateProps) {
  return (
    <div className={`min-h-screen bg-white ${className}`}>
      <div className="mx-auto max-w-7xl animate-pulse px-4">
        {/* Basic Info Skeleton */}
        <div className="mb-6 pt-6">
          <div className="mb-4 h-8 w-2/3 rounded bg-gray-200"></div>
          <div className="flex gap-4">
            <div className="h-4 w-32 rounded bg-gray-200"></div>
            <div className="h-4 w-24 rounded bg-gray-200"></div>
          </div>
        </div>

        {/* Gallery Skeleton */}
        <div className="relative mb-8 h-96 overflow-hidden rounded-xl bg-gray-200 md:h-[500px]"></div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content Skeleton */}
          <div className="space-y-8 lg:col-span-2">
            {/* Host Info Skeleton */}
            <div className="flex items-center gap-4 border-b border-gray-100 py-6">
              <div className="h-14 w-14 rounded-full bg-gray-200"></div>
              <div className="space-y-2">
                <div className="h-5 w-48 rounded bg-gray-200"></div>
                <div className="h-4 w-32 rounded bg-gray-200"></div>
              </div>
            </div>

            {/* Description Skeleton */}
            <div className="space-y-3 py-4">
              <div className="h-4 w-full rounded bg-gray-200"></div>
              <div className="h-4 w-full rounded bg-gray-200"></div>
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-4 w-5/6 rounded bg-gray-200"></div>
            </div>

            {/* Amenities Skeleton */}
            <div className="border-t border-gray-100 py-6">
              <div className="mb-4 h-6 w-48 rounded bg-gray-200"></div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded bg-gray-200"></div>
                    <div className="h-4 w-32 rounded bg-gray-200"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card Skeleton */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="mb-6 flex items-end justify-between">
                <div className="h-8 w-32 rounded bg-gray-200"></div>
                <div className="h-4 w-20 rounded bg-gray-200"></div>
              </div>

              <div className="mb-6 space-y-4">
                <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-gray-200">
                  <div className="border-r border-gray-200 p-3">
                    <div className="mb-2 h-3 w-16 rounded bg-gray-200"></div>
                    <div className="h-4 w-24 rounded bg-gray-200"></div>
                  </div>
                  <div className="p-3">
                    <div className="mb-2 h-3 w-16 rounded bg-gray-200"></div>
                    <div className="h-4 w-24 rounded bg-gray-200"></div>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="mb-2 h-3 w-20 rounded bg-gray-200"></div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                </div>
              </div>

              <div className="mb-4 h-12 w-full rounded-lg bg-gray-200"></div>
              <div className="mx-auto h-4 w-48 rounded bg-gray-200"></div>
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
  className = "",
}: PropertyErrorStateProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      className={`flex min-h-screen items-center justify-center bg-white ${className}`}
    >
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Error al cargar la propiedad
        </h1>
        <p className="mb-6 text-gray-600">{error}</p>
        <Button onClick={handleRetry}>Intentar de nuevo</Button>
      </div>
    </div>
  );
}

interface PropertyNotFoundStateProps {
  className?: string;
}

export function PropertyNotFoundState({
  className = "",
}: PropertyNotFoundStateProps) {
  return (
    <div
      className={`flex min-h-screen items-center justify-center bg-white ${className}`}
    >
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Propiedad no encontrada
        </h1>
        <p className="text-gray-600">
          La propiedad que buscas no existe o ha sido eliminada.
        </p>
      </div>
    </div>
  );
}
