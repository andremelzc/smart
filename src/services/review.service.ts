/**
 * ========================================
 * SERVICIO DE RESEÑAS
 * ========================================
 * Maneja todas las operaciones relacionadas con reseñas:
 * - Obtener pending reviews (reseñas pendientes)
 * - Crear nuevas reseñas
 * - Obtener reseñas recibidas por un host
 * - Estadísticas de reseñas
 */

import type {
  PendingReview,
  CreateReviewDto,
  CreateReviewResponse,
  GetPendingReviewsResponse,
  GetHostReviewsResponse,
  ReviewWithReviewer,
  HostReviewStats,
} from '@/src/types/dtos/reviews.dto';

export const reviewService = {
  /**
   * Obtiene las reseñas pendientes del usuario autenticado
   * @returns Promise con las pending reviews
   */
  getPendingReviews: async (): Promise<PendingReview[]> => {
    try {
      const response = await fetch('/api/reviews/pending', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GetPendingReviewsResponse = await response.json();

      if (!result.success) {
        throw new Error('Error al obtener reseñas pendientes');
      }

      return result.data || [];
    } catch (error) {
      console.error('❌ Error en getPendingReviews:', error);
      throw error;
    }
  },

  /**
   * Crea una nueva reseña
   * @param reviewData - Datos de la reseña a crear
   * @returns Promise con la respuesta de creación
   */
  createReview: async (reviewData: CreateReviewDto): Promise<CreateReviewResponse> => {
    try {
      // Validaciones básicas
      if (!reviewData.bookingId) {
        throw new Error('El ID del booking es requerido');
      }

      if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('El rating debe estar entre 1 y 5');
      }

      if (!reviewData.comment || reviewData.comment.trim().length < 10) {
        throw new Error('El comentario debe tener al menos 10 caracteres');
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: CreateReviewResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Error al crear la reseña');
      }

      return result;
    } catch (error) {
      console.error('❌ Error en createReview:', error);
      throw error;
    }
  },

  /**
   * Obtiene las reseñas recibidas por un host específico
   * @param hostId - ID del host (opcional, si no se provee usa el usuario autenticado)
   * @returns Promise con las reseñas y estadísticas
   */
  getHostReceivedReviews: async (hostId?: number): Promise<{
    reviews: ReviewWithReviewer[];
    stats: HostReviewStats;
  }> => {
    try {
      const url = hostId 
        ? `/api/reviews/host/${hostId}` 
        : '/api/reviews/host';

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GetHostReviewsResponse = await response.json();

      if (!result.success) {
        throw new Error('Error al obtener reseñas del host');
      }

      return {
        reviews: result.data || [],
        stats: result.stats || {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      };
    } catch (error) {
      console.error('❌ Error en getHostReceivedReviews:', error);
      throw error;
    }
  },

  /**
   * Verifica si un usuario tiene reseñas pendientes
   * @returns Promise<boolean> true si hay al menos una reseña pendiente
   */
  hasPendingReviews: async (): Promise<boolean> => {
    try {
      const pendingReviews = await reviewService.getPendingReviews();
      return pendingReviews.length > 0;
    } catch (error) {
      console.error('❌ Error en hasPendingReviews:', error);
      return false;
    }
  },

  /**
   * Obtiene la primera reseña pendiente disponible
   * Útil para mostrar en el modal nudge
   * @returns Promise con la primera pending review o null si no hay
   */
  getFirstPendingReview: async (): Promise<PendingReview | null> => {
    try {
      const pendingReviews = await reviewService.getPendingReviews();
      return pendingReviews.length > 0 ? pendingReviews[0] : null;
    } catch (error) {
      console.error('❌ Error en getFirstPendingReview:', error);
      return null;
    }
  },

  /**
   * Formatea el nombre completo de un usuario
   * @param firstName - Nombre
   * @param lastName - Apellido
   * @returns Nombre completo formateado
   */
  formatFullName: (firstName: string, lastName: string): string => {
    return `${firstName} ${lastName}`.trim();
  },

  /**
   * Formatea una fecha en formato legible
   * @param dateString - Fecha en formato ISO string
   * @returns Fecha formateada (ej: "15 Nov")
   */
  formatDate: (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return dateString;
    }
  },

  /**
   * Formatea una fecha completa
   * @param dateString - Fecha en formato ISO string
   * @returns Fecha formateada (ej: "15 de noviembre de 2024")
   */
  formatLongDate: (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  },

  /**
   * Calcula estadísticas de un array de reseñas
   * @param reviews - Array de reseñas
   * @returns Objeto con estadísticas calculadas
   */
  calculateStats: (reviews: ReviewWithReviewer[]): HostReviewStats => {
    const totalReviews = reviews.length;
    
    if (totalReviews === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const ratingDistribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
      ratingDistribution,
    };
  },
};
