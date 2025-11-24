import React from "react";

export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header Skeleton */}

      <div className="mb-8">
        <div className="bg-gray-medium-100 mb-2 h-8 w-64 animate-pulse rounded"></div>

        <div className="bg-gray-medium-100 h-5 w-96 animate-pulse rounded"></div>
      </div>

      {/* Content Card Skeleton */}

      <div className="border-gray-medium-100 rounded-lg border bg-white shadow-sm">
        <div className="px-6 py-4">
          {/* Profile Fields Skeleton */}

          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="border-gray-medium-100 flex items-center justify-between border-b py-4 last:border-b-0"
            >
              <div className="flex-1">
                <div className="bg-gray-medium-100 mb-2 h-4 w-24 animate-pulse rounded"></div>

                <div className="bg-gray-medium-100 h-5 w-48 animate-pulse rounded"></div>
              </div>

              <div className="ml-4">
                <div className="bg-gray-medium-100 h-8 w-16 animate-pulse rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
