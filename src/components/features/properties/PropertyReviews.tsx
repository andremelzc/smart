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
          {realAverageRating.toFixed(1)} {realTotalCount} resena
          {realTotalCount !== 1 ? "s" : ""}
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
                className="border-b border-gray-100 pb-4 last:border-b-0"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <div className="font-medium">{authorName}</div>

                    <div className="text-sm text-gray-500">{formattedDate}</div>
                  </div>

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

                <p className="text-gray-700">{comment}</p>
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
