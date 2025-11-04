'use client';

import { use } from 'react';
import { useState } from 'react';
import { usePropertyDetail } from '@/src/hooks/usePropertyDetail';
import { 
  PropertyReviews,
  PropertyHeader,
  PropertyImageGallery,
  PropertyBasicInfo,
  PropertyHostInfo,
  PropertyDescription,
  PropertyAmenities,
  PropertyHouseRules,
  PropertyBookingCard,
  CheckoutModal,
  SuccessModal
} from '@/src/components/features/properties';

import { 
  PropertyLoadingState,
  PropertyErrorState,
  PropertyNotFoundState 
} from '@/src/components/features/properties/PropertyStates';

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

interface BookingDates {
  checkIn: string;
  checkOut: string;
  guests: number;
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const { id } = use(params);
  const { property, isLoading, error } = usePropertyDetail(id);
  
  // Estados para funcionalidades
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedDates, setSelectedDates] = useState<BookingDates>({
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Funciones de cálculo y utilidades
  const getNightCount = () => {
    const { checkIn, checkOut } = selectedDates;
    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();

    if (!Number.isFinite(diff) || diff <= 0) {
      return 0;
    }

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = () => {
    if (typeof property?.basePriceNight !== 'number') {
      return 0;
    }
    const nights = getNightCount();
    return nights > 0 ? nights * property.basePriceNight : 0;
  };

  // Estados de carga
  if (isLoading) {
    return <PropertyLoadingState />;
  }

  if (error) {
    return <PropertyErrorState error={error} />;
  }

  if (!property) {
    return <PropertyNotFoundState />;
  }

  // Cálculos de precios
  const nightsCount = getNightCount();
  const totalPrice = calculateTotalPrice();
  const serviceFee = Math.round(totalPrice * 0.14);
  const grandTotal = totalPrice + serviceFee;

  // Formateo de moneda
  const currencyCode = typeof property.currencyCode === 'string' && property.currencyCode.trim().length > 0
    ? property.currencyCode.toUpperCase()
    : 'USD';
  const currencyPrefix = currencyCode === 'PEN' ? 'S/' : currencyCode === 'USD' ? '$' : `${currencyCode} `;
  const formatCurrencyValue = (value: number) => `${currencyPrefix}${value.toLocaleString('es-PE')}`;

  // Validación de capacidad máxima
  const maxGuests = typeof property.capacity === 'number' && property.capacity > 0 ? property.capacity : 1;

  // Handlers de eventos
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleDatesChange = (dates: BookingDates) => {
    setSelectedDates(dates);
  };

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
        <PropertyHeader
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
        />

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Información básica */}
          <PropertyBasicInfo
            title={property.title || 'Título no disponible'}
            city={property.city}
            stateRegion={property.stateRegion}
            country={property.country}
            averageRating={property.reviews.averageRating}
            totalReviews={property.reviews.totalCount}
            className="mb-6"
          />

          {/* Galería de imágenes */}
          <PropertyImageGallery
            images={property.images}
            title={property.title}
            className="mb-8"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenido principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Información del anfitrión */}
              <PropertyHostInfo
                propertyType={property.propertyType || 'Alojamiento'}
                host={property.host}
                capacity={property.capacity}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                beds={property.beds}
                city={property.city}
                country={property.country}
              />

              {/* Descripción */}
              <PropertyDescription
                description={property.descriptionLong}
              />

              {/* Amenidades */}
              <PropertyAmenities
                amenities={property.amenities.map(amenity => ({
                  name: amenity.name || '',
                  icon: amenity.icon
                }))}
              />

              {/* Reglas de la casa */}
              <PropertyHouseRules
                houseRules={property.houseRules}
                checkinTime={property.checkinTime}
                checkoutTime={property.checkoutTime}
              />

              {/* Reseñas */}
              <PropertyReviews reviews={property.reviews} />
            </div>

            {/* Card de reserva */}
            <div className="lg:col-span-1">
              <PropertyBookingCard
                basePriceNight={property.basePriceNight}
                currencyCode={currencyCode}
                averageRating={property.reviews.averageRating}
                totalReviews={property.reviews.totalCount}
                maxGuests={maxGuests}
                selectedDates={selectedDates}
                onDatesChange={handleDatesChange}
                onReserve={handleReserve}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de checkout */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={handleCloseCheckout}
        onPay={handlePay}
        property={{
          title: property.title || 'Propiedad',
          city: property.city,
          stateRegion: property.stateRegion,
          country: property.country,
          images: property.images,
          reviews: property.reviews
        }}
        selectedDates={selectedDates}
        pricing={{
          nightsCount,
          totalPrice,
          serviceFee,
          grandTotal
        }}
        currencyFormatter={formatCurrencyValue}
      />

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={handleCloseSuccess}
      />
    </>
  );
}
