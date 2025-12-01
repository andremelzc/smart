// ========================================
// TIPOS Y DTOs PARA SISTEMA DE RESEÑAS
// ========================================

/**
 * Tipo de reseña:
 * - 'guest': El inquilino opina sobre la propiedad/anfitrión
 * - 'host': El anfitrión opina sobre el huésped
 */
export type ReviewType = 'guest' | 'host';

/**
 * Interfaz para una reseña completa
 */
export interface Review {
  reviewId: number;
  bookingId: number;
  reviewerId: number;
  revieweeId: number;
  reviewType: ReviewType;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interfaz para una reseña con información del reviewer
 */
export interface ReviewWithReviewer extends Review {
  reviewerFirstName: string;
  reviewerLastName: string;
  reviewerImage?: string;
  propertyId?: number;
  propertyTitle?: string;
  checkinDate?: string;
  checkoutDate?: string;
}

/**
 * Interfaz para reseñas pendientes (pending reviews)
 */
export interface PendingReview {
  reviewId: number;
  bookingId: number;
  userId: number;
  reviewType: ReviewType;
  createdAt: string;
  isCompleted: boolean;
  // Información adicional del booking y propiedad
  checkinDate: string;
  checkoutDate: string;
  bookingStatus: string;
  propertyId: number;
  propertyTitle: string;
  propertyImage?: string;
  city: string;
  stateRegion: string;
  // Información del otro usuario (host o tenant)
  otherUserFirstName: string;
  otherUserLastName: string;
  otherUserImage?: string;
}

/**
 * DTO para crear una nueva reseña
 */
export interface CreateReviewDto {
  bookingId: number;
  reviewType: ReviewType;
  rating: number;
  comment: string;
}

/**
 * Respuesta al crear una reseña
 */
export interface CreateReviewResponse {
  success: boolean;
  message: string;
  reviewId?: number;
}

/**
 * Estadísticas de reseñas para un host
 */
export interface HostReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

/**
 * Respuesta de API para obtener pending reviews
 */
export interface GetPendingReviewsResponse {
  success: boolean;
  data: PendingReview[];
  count: number;
}

/**
 * Respuesta de API para obtener reseñas recibidas por un host
 */
export interface GetHostReviewsResponse {
  success: boolean;
  data: ReviewWithReviewer[];
  stats: HostReviewStats;
}

/**
 * Filtros para buscar reseñas
 */
export interface ReviewFilters {
  rating?: number; // Filtrar por rating específico
  propertyId?: number; // Filtrar por propiedad
  searchTerm?: string; // Buscar en comentarios o nombres
}
