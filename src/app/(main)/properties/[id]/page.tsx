'use client';

import { use } from 'react';
import { usePropertyDetail } from '@/src/hooks/usePropertyDetail';
import { Button } from '@/src/components/ui/Button';
import { PropertyReviews } from '@/src/components/features/properties/PropertyReviews';
import { 
  Star, 
  MapPin, 
  Users, 
  Bed, 
  Bath,
  Wifi,
  Car,
  Tv,
  AirVent,
  Coffee,
  Shield,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Home,
  Waves,
  Dumbbell,
  CreditCard,
  Lock,
  CheckCircle,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

// Mapeo de iconos para amenities
const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  tv: Tv,
  ac: AirVent,
  air_conditioning: AirVent,
  kitchen: Coffee,
  security: Shield,
  pool: Waves,
  gym: Dumbbell,
  // Añadir más mapeos según necesites
};

export default function PropertyPage({ params }: PropertyPageProps) {
  const { id } = use(params);
  const { property, isLoading, error } = usePropertyDetail(id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDates, setSelectedDates] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  // Estados para funcionalidades
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset image index when property changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [property?.propertyId]);

  useEffect(() => {
    if (!showCheckout && !showSuccess) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showCheckout, showSuccess]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="h-8 bg-gray-200 rounded mb-4 mx-4"></div>
          
          {/* Image gallery skeleton */}
          <div className="h-96 bg-gray-200 rounded-lg mx-4 mb-6"></div>
          
          {/* Content skeleton */}
          <div className="mx-4 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar la propiedad</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Propiedad no encontrada</h1>
          <p className="text-gray-600">La propiedad que buscas no existe o ha sido eliminada.</p>
        </div>
      </div>
    );
  }

  const nightsCount = getNightCount();
  const totalPrice = calculateTotalPrice();
  const serviceFee = Math.round(totalPrice * 0.14);
  const grandTotal = totalPrice + serviceFee;

  const currencyCode = typeof property.currencyCode === 'string' && property.currencyCode.trim().length > 0
    ? property.currencyCode.toUpperCase()
    : 'USD';
  const currencyPrefix = currencyCode === 'PEN' ? 'S/' : currencyCode === 'USD' ? '$' : `${currencyCode} `;
  const formatCurrencyValue = (value: number) => `${currencyPrefix}${value.toLocaleString('es-PE')}`;

  const formatDateLabel = (value: string) => {
    try {
      return new Intl.DateTimeFormat('es-PE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  const maxGuests = typeof property.capacity === 'number' && property.capacity > 0 ? property.capacity : 1;
  const guestsCount = Math.min(selectedDates.guests, maxGuests);
  const checkInLabel = selectedDates.checkIn ? formatDateLabel(selectedDates.checkIn) : '';
  const checkOutLabel = selectedDates.checkOut ? formatDateLabel(selectedDates.checkOut) : '';
  const guestsLabel = `${guestsCount} huésped${guestsCount !== 1 ? 'es' : ''}`;
  const summaryImage = property.images && property.images.length > 0
    ? property.images[currentImageIndex] || property.images[0]
    : undefined;
  const ratingLabel = typeof property.reviews.averageRating === 'number'
    ? property.reviews.averageRating.toFixed(1)
    : '0.0';

  function nextImage() {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  }

  function prevImage() {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  }

  function getNightCount() {
    const { checkIn, checkOut } = selectedDates;
    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();

    if (!Number.isFinite(diff) || diff <= 0) {
      return 0;
    }

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function calculateTotalPrice() {
    if (typeof property?.basePriceNight !== 'number') {
      return 0;
    }

    const nights = getNightCount();
    return nights > 0 ? nights * property.basePriceNight : 0;
  }

  const handleReserve = () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) {
      return;
    }
    if (getNightCount() <= 0) {
      return;
    }
    setShowCheckout(true);
    setShowSuccess(false);
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
  };

  const handlePay = () => {
    setShowCheckout(false);
    setShowSuccess(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  return (
    <>
      <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Volver
            </button>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className="flex items-center gap-2 text-gray-600 hover:text-red-500"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                Guardar
              </button>
              
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Share2 className="w-5 h-5" />
                Compartir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Title and location */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title || 'Título no disponible'}</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{property.reviews.averageRating?.toFixed(1) || '0.0'}</span>
              <span>({property.reviews.totalCount || 0} reseñas)</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{property.city}, {property.stateRegion}, {property.country}</span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden bg-gray-200">
            {property.images && property.images.length > 0 ? (
              <>
                <img
                  src={property.images[currentImageIndex]?.url || '/placeholder-room.svg'}
                  alt={property.images[currentImageIndex]?.alt || property.title || 'Propiedad'}
                  className="w-full h-full object-cover"
                />
                
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-10"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-10"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    {/* Image indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                      {property.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500">No hay imágenes disponibles</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host and basic info */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">
                    {typeof property.propertyType === 'string' ? property.propertyType : 'Alojamiento'} hospedado por {typeof property.host.name === 'string' ? property.host.name : 'Anfitrión'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {typeof property.capacity === 'number' ? property.capacity : 0} huéspedes
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      {typeof property.bedrooms === 'number' ? property.bedrooms : 0} habitaciones
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      {typeof property.bathrooms === 'number' ? property.bathrooms : 0} baños
                    </span>
                    {property.beds > 0 && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        {typeof property.beds === 'number' ? property.beds : 0} camas
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="w-12 h-12 bg-blue-light-500 rounded-full flex items-center justify-center ml-4">
                  <span className="text-xl font-semibold text-white">
                    {typeof property.host.name === 'string' && property.host.name.length > 0
                      ? property.host.name.charAt(0).toUpperCase()
                      : 'H'
                    }
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {property.host.isVerified && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Anfitrión verificado</span>
                  </div>
                )}
                
                <div className="text-sm text-gray-600">
                  Miembro desde {(() => {
                    try {
                      const date = typeof property.host.memberSince === 'string' 
                        ? new Date(property.host.memberSince)
                        : new Date();
                      return date.getFullYear();
                    } catch {
                      return 'Fecha no disponible';
                    }
                  })()}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold mb-3">Acerca de este lugar</h3>
              <p className="text-gray-700 leading-relaxed">
                {typeof property.descriptionLong === 'string' ? property.descriptionLong : ''}
              </p>
            </div>

            {/* Amenities */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold mb-4">Lo que ofrece este lugar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {property.amenities
                  .slice(0, showAllAmenities ? property.amenities.length : 6)
                  .map((amenity, index) => {
                    const IconComponent = amenityIcons[amenity.icon || ''] || Wifi;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-gray-600" />
                        <span>{typeof amenity.name === 'string' ? amenity.name : amenity.name || ''}</span>
                      </div>
                    );
                  })}
              </div>
              
              {property.amenities.length > 6 && (
                <button
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  className="mt-4 text-blue-light-500 font-medium hover:underline"
                >
                  {showAllAmenities ? 'Mostrar menos' : `Mostrar los ${property.amenities.length} servicios`}
                </button>
              )}
            </div>

            {/* House Rules */}
            {property.houseRules && (
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold mb-3">Reglas de la casa</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span>Check-in: {typeof property.checkinTime === 'string' ? property.checkinTime : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Check-out: {typeof property.checkoutTime === 'string' ? property.checkoutTime : ''}</span>
                  </div>
                  <p className="text-gray-700 mt-3">
                    {typeof property.houseRules === 'string' ? property.houseRules : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Reviews */}
            <PropertyReviews reviews={property.reviews} />
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="border border-gray-300 rounded-xl p-6 shadow-lg bg-white">
                <div className="mb-6">
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold">
                      {formatCurrencyValue(typeof property.basePriceNight === 'number' ? property.basePriceNight : 0)}
                    </span>
                    <span className="text-gray-600">/ noche</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">
                      {typeof property.reviews.averageRating === 'number' 
                        ? property.reviews.averageRating.toFixed(1) 
                        : '0.0'
                      }
                    </span>
                    <span className="text-gray-600">
                      ({typeof property.reviews.totalCount === 'number' 
                        ? property.reviews.totalCount 
                        : 0
                      } reseñas)
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-0 border border-gray-300 rounded-lg overflow-hidden">
                    <div className="p-3 border-r border-gray-300">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        LLEGADA
                      </label>
                      <input
                        type="date"
                        value={selectedDates.checkIn}
                        onChange={(e) => setSelectedDates(prev => ({ ...prev, checkIn: e.target.value }))}
                        className="w-full text-sm border-none outline-none bg-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="p-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        SALIDA
                      </label>
                      <input
                        type="date"
                        value={selectedDates.checkOut}
                        onChange={(e) => setSelectedDates(prev => ({ ...prev, checkOut: e.target.value }))}
                        className="w-full text-sm border-none outline-none bg-transparent"
                        min={selectedDates.checkIn || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="border border-gray-300 rounded-lg p-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      HUÉSPEDES
                    </label>
                    <select
                      value={guestsCount}
                      onChange={(e) => {
                        const nextValue = Math.min(parseInt(e.target.value, 10) || 1, maxGuests);
                        setSelectedDates((prev) => ({ ...prev, guests: nextValue }));
                      }}
                      className="w-full text-sm border-none outline-none bg-transparent"
                    >
                      {Array.from({ length: maxGuests }, (_, index) => index + 1).map((value) => (
                        <option key={value} value={value}>
                          {value} huésped{value !== 1 ? 'es' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  className="w-full mb-4"
                  size="lg"
                  disabled={!selectedDates.checkIn || !selectedDates.checkOut}
                  onClick={handleReserve}
                >
                  {selectedDates.checkIn && selectedDates.checkOut
                    ? 'Reservar'
                    : 'Selecciona fechas'
                  }
                </Button>

                <p className="text-center text-sm text-gray-600 mb-4">
                  No se realizará ningún cargo todavía
                </p>

                {selectedDates.checkIn && selectedDates.checkOut && nightsCount > 0 && (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {formatCurrencyValue(typeof property.basePriceNight === 'number' ? property.basePriceNight : 0)} x {nightsCount} noche{nightsCount > 1 ? 's' : ''}
                      </span>
                      <span>{formatCurrencyValue(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tarifa de servicio</span>
                      <span>{formatCurrencyValue(serviceFee)}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-3 border-t border-gray-200">
                      <span>Total</span>
                      <span>{formatCurrencyValue(grandTotal)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 px-4">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
            <button
              type="button"
              onClick={handleCloseCheckout}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-100"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
              <section className="flex flex-col gap-6 bg-blue-light-50 p-8">
                <header className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-light-600">Resumen de tu reserva</p>
                  <h2 className="text-2xl font-bold text-gray-900">Confirma los detalles</h2>
                </header>

                <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm">
                  {summaryImage?.url ? (
                    <img
                      src={summaryImage.url}
                      alt={summaryImage.alt || property.title || 'Propiedad'}
                      className="h-20 w-20 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-light-100 text-lg font-semibold text-blue-light-600">
                      <Home className="h-6 w-6" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-gray-900">{property.title || 'Propiedad'}</h3>
                    <p className="text-sm text-gray-600">
                      {property.city}, {property.stateRegion}, {property.country}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{ratingLabel}</span>
                      <span>({property.reviews.totalCount || 0} reseñas)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Fechas</span>
                    <span>{checkInLabel} – {checkOutLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Huéspedes</span>
                    <span>{guestsLabel}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Precio base ({nightsCount} noche{nightsCount > 1 ? 's' : ''})</span>
                      <span className="font-medium text-gray-900">{formatCurrencyValue(totalPrice)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-gray-600">
                      <span>Tarifa de servicio</span>
                      <span className="font-medium text-gray-900">{formatCurrencyValue(serviceFee)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
                      <span>Total a pagar</span>
                      <span>{formatCurrencyValue(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="flex flex-col gap-6 p-8">
                <header className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-light-600">
                    <CreditCard className="h-5 w-5" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Simulación de pago</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Introduce los datos</h2>
                  <p className="text-sm text-gray-600">Esta es una vista previa visual de la pasarela de pago.</p>
                </header>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Nombre en la tarjeta</label>
                    <input
                      type="text"
                      placeholder="Juan Pérez"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Número de tarjeta</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de expiración</label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Correo de confirmación</label>
                    <input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Button type="button" className="w-full" size="lg" onClick={handlePay}>
                    {`Pagar${grandTotal > 0 ? ` ${formatCurrencyValue(grandTotal)}` : ''}`}
                  </Button>
                  <p className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Lock className="h-4 w-4" />
                    Tus datos están protegidos con cifrado SSL.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-gray-900/70 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-2xl">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Reserva exitosa</h2>
            <p className="mb-6 text-sm text-gray-600">
              Tu reserva ha sido confirmada correctamente. Recibirás un correo con los detalles.
            </p>
            <Button className="w-full" size="lg" onClick={handleCloseSuccess}>
              Entendido
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
