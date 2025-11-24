// Tipo para el body del request de actualización
export interface UpdatePropertyBody {
  // Campos de PROPERTIES
  title?: string;
  basePriceNight?: number;
  addressText?: string;
  city?: string;
  stateRegion?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  // Campos de PROPERTY_DETAILS
  descriptionLong?: string;
  houseRules?: string;
  checkinTime?: string;
  checkoutTime?: string;
  capacity?: number;
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
}

// Tipo para la respuesta exitosa de actualización
export interface UpdatePropertyResponse {
  success: true;
  message: string;
  propertyId: number;
}

// Tipo para la respuesta de error
export interface PropertyErrorResponse {
  error: string;
  details?: string;
}

// ========================================
// AVAILABILITY TYPES
// ========================================

// Tipo para un día específico de disponibilidad
export interface PropertyAvailabilityDay {
  date: string; // YYYY-MM-DD
  available: boolean;
  reason: "available" | "booked" | "blocked" | "maintenance";
}

// Tipo para resumen de disponibilidad
export interface AvailabilitySummary {
  totalDays: number;
  availableDays: number;
  bookedDays: number;
  blockedDays: number;
  maintenanceDays: number;
}

// Tipo para respuesta de disponibilidad
export interface PropertyAvailabilityResponse {
  success: boolean;
  data: PropertyAvailabilityDay[];
  meta: {
    propertyId: number;
    startDate: string;
    endDate: string;
    totalDays: number;
    availableDays: number;
    bookedDays: number;
    blockedDays: number;
    maintenanceDays: number;
  };
}

// Tipo para verificar rango de disponibilidad
export interface AvailabilityCheckRequest {
  checkinDate: string; // YYYY-MM-DD
  checkoutDate: string; // YYYY-MM-DD
}

export interface AvailabilityCheckResponse {
  success: boolean;
  available: boolean;
  message: string;
  checkinDate: string;
  checkoutDate: string;
}

// Tipo para los filtros de búsqueda de propiedades
export interface PropertyFilterDto {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  rooms?: number;
  beds?: number;
  baths?: number;
  latMin?: number;
  latMax?: number;
  lngMin?: number;
  lngMax?: number;
  amenities?: number[];
  adults?: number;
  children?: number;
  babies?: number;
  pets?: number;
  startDate?: string;
  endDate?: string;
  orderBy?: "price" | "rating";
}

// Tipo para la información del host
export interface HostInfo {
  id: number;
  name: string;
  email?: string;
  profileImage?: string;
  memberSince: string;
  isVerified?: boolean;
}

// Tipo para amenities
export interface PropertyAmenity {
  id?: number;
  name?: string;
  icon?: string;
  description?: string;
}

// Tipo para imágenes de la propiedad
export interface PropertyImage {
  id: number;
  url: string;
  alt: string;
  isPrimary: boolean;
}

// Tipo para una review individual
export interface PropertyReview {
  rating: number;
  comment: string;
  createdAt: string;
  authorName: string;
}

// Tipo para reviews y ratings
export interface PropertyReviews {
  totalCount: number;
  averageRating: number;
  reviewsList?: PropertyReview[];
}

// Tipo para una propiedad completa con todos los detalles
export interface PropertyDetail {
  propertyId: number;
  hostId: number;
  title: string;
  propertyType?: string;
  basePriceNight: number;
  currencyCode?: string;
  addressText: string;
  city: string;
  stateRegion: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  createdAt?: string;
  updatedAt?: string;
  isActive: boolean;
  // Property details
  descriptionLong: string;
  houseRules: string;
  checkinTime: string;
  checkoutTime: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  // Related data
  host: HostInfo;
  amenities: PropertyAmenity[];
  images: PropertyImage[];
  reviews: PropertyReviews;
}

// Tipo para la respuesta del GET de una propiedad específica
export interface PropertyDetailResponse {
  success: true;
  data: PropertyDetail;
}
