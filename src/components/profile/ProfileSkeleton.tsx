import React from 'react';

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-medium-100 rounded w-64 mb-2 animate-pulse"></div>
        <div className="h-5 bg-gray-medium-100 rounded w-96 animate-pulse"></div>
      </div>

      {/* Content Card Skeleton */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-medium-100">
        <div className="px-6 py-4">
          {/* Profile Fields Skeleton */}
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center justify-between py-4 border-b border-gray-medium-100 last:border-b-0">
              <div className="flex-1">
                <div className="h-4 bg-gray-medium-100 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-5 bg-gray-medium-100 rounded w-48 animate-pulse"></div>
              </div>
              <div className="ml-4">
                <div className="h-8 bg-gray-medium-100 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}