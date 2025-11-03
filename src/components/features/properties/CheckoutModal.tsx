'use client';

import { useEffect } from 'react';
import { X, Star, Home, CreditCard, Lock } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

interface PropertyImage {
  url: string;
  alt?: string;
}

interface CheckoutProperty {
  title: string;
  city: string;
  stateRegion: string;
  country: string;
  images: PropertyImage[];
  reviews: {
    averageRating?: number;
    totalCount?: number;
  };
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPay: () => void;
  property: CheckoutProperty;
  selectedDates: {
    checkIn: string;
    checkOut: string;
    guests: number;
  };
  pricing: {
    nightsCount: number;
    totalPrice: number;
    serviceFee: number;
    grandTotal: number;
  };
  currencyFormatter: (value: number) => string;
}

export function CheckoutModal({
  isOpen,
  onClose,
  onPay,
  property,
  selectedDates,
  pricing,
  currencyFormatter
}: CheckoutModalProps) {
  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Formatear fechas para mostrar
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

  const checkInLabel = selectedDates.checkIn ? formatDateLabel(selectedDates.checkIn) : '';
  const checkOutLabel = selectedDates.checkOut ? formatDateLabel(selectedDates.checkOut) : '';
  const guestsLabel = `${selectedDates.guests} huésped${selectedDates.guests !== 1 ? 'es' : ''}`;
  
  const summaryImage = property.images && property.images.length > 0
    ? property.images[0]
    : undefined;
  
  const ratingLabel = typeof property.reviews.averageRating === 'number'
    ? property.reviews.averageRating.toFixed(1)
    : '0.0';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 px-4">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-4xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-100 z-10"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
          {/* Resumen de la reserva */}
          <section className="flex flex-col gap-6 bg-blue-light-50 p-8">
            <header className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-light-600">
                Resumen de tu reserva
              </p>
              <h2 className="text-2xl font-bold text-gray-900">Confirma los detalles</h2>
            </header>

            {/* Información de la propiedad */}
            <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm">
              {summaryImage?.url ? (
                <img
                  src={summaryImage.url}
                  alt={summaryImage.alt || property.title}
                  className="h-20 w-20 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-light-100 text-lg font-semibold text-blue-light-600">
                  <Home className="h-6 w-6" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold text-gray-900">
                  {property.title}
                </h3>
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

            {/* Detalles de la reserva */}
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
                  <span>Precio base ({pricing.nightsCount} noche{pricing.nightsCount > 1 ? 's' : ''})</span>
                  <span className="font-medium text-gray-900">
                    {currencyFormatter(pricing.totalPrice)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-gray-600">
                  <span>Tarifa de servicio</span>
                  <span className="font-medium text-gray-900">
                    {currencyFormatter(pricing.serviceFee)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
                  <span>Total a pagar</span>
                  <span>{currencyFormatter(pricing.grandTotal)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Formulario de pago */}
          <section className="flex flex-col gap-6 p-8">
            <header className="space-y-2">
              <div className="flex items-center gap-2 text-blue-light-600">
                <CreditCard className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Simulación de pago
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Introduce los datos</h2>
              <p className="text-sm text-gray-600">
                Esta es una vista previa visual de la pasarela de pago.
              </p>
            </header>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nombre en la tarjeta
                </label>
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                />
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Número de tarjeta
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Fecha de expiración
                  </label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                  />
                </div>
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Correo de confirmación
                </label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button type="button" className="w-full" size="lg" onClick={onPay}>
                {`Pagar${pricing.grandTotal > 0 ? ` ${currencyFormatter(pricing.grandTotal)}` : ''}`}
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
  );
}