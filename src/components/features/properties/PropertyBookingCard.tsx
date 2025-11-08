'use client';

import { Star } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

interface BookingDates {
  checkIn: string;
  checkOut: string;
  guests: number;
}

interface PropertyBookingCardProps {
  basePriceNight: number;
  currencyCode: string;
  averageRating?: number;
  totalReviews?: number;
  maxGuests: number;
  selectedDates: BookingDates;
  onDatesChange: (dates: BookingDates) => void;
  onReserve: () => void;
  className?: string;
}

export function PropertyBookingCard({
  basePriceNight,
  currencyCode,
  averageRating,
  totalReviews,
  maxGuests,
  selectedDates,
  onDatesChange,
  onReserve,
  className = ''
}: PropertyBookingCardProps) {
  // Funciones de calculo
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
    const nights = getNightCount();
    return nights > 0 ? nights * basePriceNight : 0;
  };

  // Formateo de moneda
  const formatCurrency = currencyCode === 'PEN' ? 'S/' : currencyCode === 'USD' ? '$' : `${currencyCode} `;
  const formatCurrencyValue = (value: number) => `${formatCurrency}${value.toLocaleString('es-PE')}`;

  // Calculos de precios
  const nightsCount = getNightCount();
  const totalPrice = calculateTotalPrice();
  const serviceFee = Math.round(totalPrice * 0.14);
  const grandTotal = totalPrice + serviceFee;

  // Validacion de huespedes
  const guestsCount = Math.min(selectedDates.guests, maxGuests);

  const handleGuestsChange = (newGuests: number) => {
    const validGuests = Math.min(newGuests, maxGuests);
    onDatesChange({ ...selectedDates, guests: validGuests });
  };

  const canReserve = selectedDates.checkIn && selectedDates.checkOut && nightsCount > 0;

  return (
    <div className={`sticky top-24 ${className}`}>
      <div className="border border-gray-300 rounded-xl p-6 shadow-lg bg-white">
        {/* Precio y rating */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-2xl font-bold">
              {formatCurrencyValue(basePriceNight)}
            </span>
            <span className="text-gray-600">/ noche</span>
          </div>
          
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">
              {typeof averageRating === 'number' ? averageRating.toFixed(1) : '0.0'}
            </span>
            <span className="text-gray-600">
              ({typeof totalReviews === 'number' ? totalReviews : 0} resenas)
            </span>
          </div>
        </div>

        {/* Formulario de fechas */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-0 border border-gray-300 rounded-lg overflow-hidden">
            <div className="p-3 border-r border-gray-300">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                LLEGADA
              </label>
              <input
                type="date"
                value={selectedDates.checkIn}
                onChange={(e) => onDatesChange({ ...selectedDates, checkIn: e.target.value })}
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
                onChange={(e) => onDatesChange({ ...selectedDates, checkOut: e.target.value })}
                className="w-full text-sm border-none outline-none bg-transparent"
                min={selectedDates.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg p-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              HUESPEDES
            </label>
            <select
              value={guestsCount}
              onChange={(e) => handleGuestsChange(parseInt(e.target.value, 10) || 1)}
              className="w-full text-sm border-none outline-none bg-transparent"
            >
              {Array.from({ length: maxGuests }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  {value} huesped{value !== 1 ? 'es' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Boton de reserva */}
        <Button
          className="w-full mb-4"
          size="lg"
          disabled={!canReserve}
          onClick={onReserve}
        >
          {canReserve ? 'Reservar' : 'Selecciona fechas'}
        </Button>

        <p className="text-center text-sm text-gray-600 mb-4">
          No se realizara ningun cargo todavia
        </p>

        {/* Desglose de precios */}
        {canReserve && (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {formatCurrencyValue(basePriceNight)} x {nightsCount} noche{nightsCount > 1 ? 's' : ''}
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
  );
}