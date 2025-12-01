"use client";

import { useState } from "react";

import { Star } from "lucide-react";

import type { PropertyReviews as PropertyReviewsType } from "@/src/types/dtos/properties.dto";

interface PropertyReviewsProps {
  reviews: PropertyReviewsType;
}

export const PropertyReviews = ({ reviews }: PropertyReviewsProps) => {
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Validacion segura de reviews

  if (!reviews || typeof reviews !== "object") {
    return null;
  }

  const totalCount =
    typeof reviews.totalCount === "number" ? reviews.totalCount : 0;

  const averageRating =
    typeof reviews.averageRating === "number" ? reviews.averageRating : 0;

  // Verificar si realmente hay resenas en la lista (mas confiable que totalCount)

  const actualReviews = Array.isArray(reviews.reviewsList)
    ? reviews.reviewsList
    : [];

  const hasReviews = actualReviews.length > 0;

  if (!hasReviews) {
    return (
      <div>
        <div className="mb-6 flex items-center gap-2">
          <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />

          <h3 className="text-xl font-semibold">Sin reseñas aun</h3>
        </div>

        <p className="text-gray-600">Esta propiedad aun no tiene reseñas.</p>
      </div>
    );
  }

  // Calcular el rating promedio real si los datos del backend estan inconsistentes

  const realAverageRating =
    averageRating > 0
      ? averageRating
      : actualReviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
        actualReviews.length;

  const realTotalCount = Math.max(totalCount, actualReviews.length);

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />

        <h3 className="text-xl font-semibold">
          {realAverageRating.toFixed(1)} ({realTotalCount} reseña
          {realTotalCount !== 1 ? "s" : ""})
        </h3>
      </div>

      <div className="space-y-6">
        {actualReviews

          .slice(0, showAllReviews ? actualReviews.length : 3)

          .map((review, index) => {
            // Validaciones seguras para cada review

            const authorName =
              typeof review?.authorName === "string"
                ? review.authorName
                : "Usuario";

            const comment =
              typeof review?.comment === "string" ? review.comment : "";

            const rating =
              typeof review?.rating === "number" ? review.rating : 0;

            let formattedDate = "Fecha no disponible";

            try {
              if (typeof review?.createdAt === "string" && review.createdAt) {
                const date = new Date(review.createdAt);

                if (!isNaN(date.getTime())) {
                  formattedDate = date.toLocaleDateString("es-ES", {
                    year: "numeric",

                    month: "long",
                  });
                }
              }
            } catch {
              // Mantener el valor por defecto
            }

            return (
              <div
                key={index}
                className="border-b border-gray-100 pb-6 last:border-b-0"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="font-medium text-gray-900">{authorName}</div>

                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Comentario en card azul */}
                {comment && (
                  <div className="mb-3 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <svg
                        className="h-5 w-5 flex-shrink-0 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      <p className="flex-1 italic text-gray-700">
                        &ldquo;{comment}&rdquo;
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-500">{formattedDate}</div>
              </div>
            );
          })}

        {actualReviews.length > 3 && (
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="text-blue-light-500 font-medium hover:underline"
          >
            {showAllReviews
              ? "Mostrar menos reseñas"
              : `Mostrar las ${actualReviews.length} reseñas`}
          </button>
        )}
      </div>
    </div>
  );
};
