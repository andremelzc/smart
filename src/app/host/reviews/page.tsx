// En: src/app/host/reviews/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Filter, Search, Loader2, TrendingUp } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/src/components/ui/Button";
import { reviewService } from "@/src/services/review.service";
import type { HostReviewStats } from "@/src/types/dtos/reviews.dto";

// Tipo para una reseña individual (compatible con la vista)
type Review = {
  id: number;
  guestName: string;
  guestAvatar?: string;
  propertyTitle: string;
  propertyId: number;
  rating: number;
  comment: string;
  createdAt: string;
  checkInDate: string;
  checkOutDate: string;
};

// Tipo para las estadísticas de reseñas
type ReviewStats = HostReviewStats;

export default function ReviewsPage() {
  // Hook de autenticación para obtener el host ID
  const { user } = useAuth();

  // Estados para almacenar las reseñas y estadísticas
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [propertyFilter, setPropertyFilter] = useState<number | null>(null);

  // Estados para las propiedades disponibles (para el filtro)
  const [properties, setProperties] = useState<{ id: number; title: string }[]>([]);

  // Efecto para cargar las reseñas cuando el componente se monta
  useEffect(() => {
    if (!user?.id) return;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        // Llamar a la API real para obtener reseñas del host
        const { reviews: apiReviews, stats: apiStats } = await reviewService.getHostReceivedReviews();

        // Mapear ReviewWithReviewer[] a Review[] para compatibilidad con la UI
        const mappedReviews: Review[] = apiReviews.map((review) => ({
          id: review.reviewId,
          guestName: reviewService.formatFullName(review.reviewerFirstName, review.reviewerLastName),
          guestAvatar: review.reviewerImage,
          propertyTitle: review.propertyTitle || '',
          propertyId: review.propertyId || 0,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          checkInDate: review.checkinDate || '',
          checkOutDate: review.checkoutDate || '',
        }));

        // Extraer propiedades únicas para el filtro
        const uniqueProperties = Array.from(
          new Map(
            mappedReviews.map((r) => [r.propertyId, { id: r.propertyId, title: r.propertyTitle }])
          ).values()
        );

        setReviews(mappedReviews);
        setStats(apiStats);
        setProperties(uniqueProperties);
      } catch (err) {
        console.error("Error al cargar reseñas:", err);
        setError("No se pudieron cargar las reseñas. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user?.id]);

  // Función para filtrar reseñas según los criterios seleccionados
  const filteredReviews = reviews.filter((review) => {
    // Filtrar por término de búsqueda
    const matchesSearch =
      !searchTerm ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtrar por rating
    const matchesRating = !ratingFilter || review.rating === ratingFilter;

    // Filtrar por propiedad
    const matchesProperty = !propertyFilter || review.propertyId === propertyFilter;

    return matchesSearch && matchesRating && matchesProperty;
  });

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Componente para mostrar las estrellas de rating
  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );

  // Componente para la barra de distribución de ratings
  const RatingBar = ({ count, total }: { count: number; total: number }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-yellow-400 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  // Renderizar estado de carga
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Renderizar estado de error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="ghost"
            className="mt-4"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado de la página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reseñas de Huéspedes</h1>
        <p className="mt-2 text-gray-600">
          Gestiona y responde a las reseñas de tus propiedades
        </p>
      </div>

      {/* Sección de estadísticas */}
      {stats && (
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {/* Card: Total de reseñas */}
          <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Reseñas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
              </div>
            </div>
          </div>

          {/* Card: Calificación promedio */}
          <div className="rounded-2xl border border-yellow-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Calificación Promedio</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.averageRating.toFixed(1)}
                  </p>
                  <span className="text-sm text-gray-500">/ 5.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Tendencia */}
          <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Reseñas Positivas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(
                    ((stats.ratingDistribution[5] + stats.ratingDistribution[4]) /
                      stats.totalReviews) *
                      100
                  )}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distribución de calificaciones */}
      {stats && (
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Distribución de Calificaciones
          </h2>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-4">
                <span className="w-12 text-sm text-gray-600">{rating} ⭐</span>
                <RatingBar
                  count={stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                  total={stats.totalReviews}
                />
                <span className="w-12 text-right text-sm text-gray-600">
                  {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
        {/* Barra de búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar reseñas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Filtro por calificación */}
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={ratingFilter ?? ""}
            onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : null)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Todas las calificaciones</option>
            <option value="5">5 estrellas</option>
            <option value="4">4 estrellas</option>
            <option value="3">3 estrellas</option>
            <option value="2">2 estrellas</option>
            <option value="1">1 estrella</option>
          </select>
        </div>

        {/* Filtro por propiedad */}
        <div className="flex items-center gap-2">
          <select
            value={propertyFilter ?? ""}
            onChange={(e) => setPropertyFilter(e.target.value ? Number(e.target.value) : null)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Todas las propiedades</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          // Estado vacío
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No se encontraron reseñas
            </h3>
            <p className="text-gray-600">
              {searchTerm || ratingFilter || propertyFilter
                ? "Intenta ajustar los filtros para ver más resultados."
                : "Aún no has recibido reseñas de tus huéspedes."}
            </p>
          </div>
        ) : (
          // Tarjetas de reseñas
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Encabezado de la reseña */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Avatar del huésped */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold shadow-md">
                    {review.guestName.charAt(0).toUpperCase()}
                  </div>

                  {/* Información del huésped y propiedad */}
                  <div>
                    <h3 className="font-semibold text-gray-900">{review.guestName}</h3>
                    <p className="text-sm text-gray-600">{review.propertyTitle}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Estadía: {formatDate(review.checkInDate)} - {formatDate(review.checkOutDate)}
                    </p>
                  </div>
                </div>

                {/* Fecha de la reseña */}
                <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
              </div>

              {/* Calificación */}
              <div className="mb-3">
                <StarRating rating={review.rating} />
              </div>

              {/* Comentario */}
              <p className="text-gray-700">{review.comment}</p>

              {/* Acciones (botón para responder - placeholder) */}
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" className="text-blue-600">
                  Responder
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
