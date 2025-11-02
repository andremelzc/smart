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
}
