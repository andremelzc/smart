"use client";

import { useState, useMemo, useCallback } from "react";
import * as React from "react";
import { Star, Calendar as CalendarIcon, Users } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/src/components/ui/Button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePropertyAvailability } from "@/src/hooks/usePropertyAvailability";
import {
  GuestPopover,
  GuestCounts,
} from "@/src/components/layout/search/GuestPopover";

interface BookingDates {
  checkIn: string;
  checkOut: string;
  guests: GuestCounts;
}

interface PropertyBookingCardProps {
  propertyId: number;
  basePriceNight: number;
  currencyCode: string;
  averageRating?: number;
  totalReviews?: number;
  maxGuests: number;
  selectedDates: BookingDates;
  onDatesChange: (dates: BookingDates) => void;
  onReserve: () => void;
  className?: string;
  propertyOccupied: boolean;
}

export function PropertyBookingCard({
  propertyId,
  basePriceNight,
  currencyCode,
  averageRating,
  totalReviews,
  maxGuests,
  selectedDates,
  onDatesChange,
  onReserve,
  className = "",
  propertyOccupied,
}: PropertyBookingCardProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [guestPopoverOpen, setGuestPopoverOpen] = useState(false);
  const guestPopoverRef = React.useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  // Memoizar fechas para evitar recrearlas en cada render
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0); // Normalizar a medianoche
    return date;
  }, []);

  const threeMonthsLater = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0); // Normalizar a medianoche
    date.setDate(date.getDate() + 90);
    return date;
  }, []);

  const { availability } = usePropertyAvailability(
    propertyId,
    today,
    threeMonthsLater
  );

  // Cerrar guest popover al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        guestPopoverRef.current &&
        !guestPopoverRef.current.contains(event.target as Node)
      ) {
        setGuestPopoverOpen(false);
      }
    };

    if (guestPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [guestPopoverOpen]);

  // Función para convertir Date a string YYYY-MM-DD sin problemas de zona horaria
  const dateToString = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Función para convertir string YYYY-MM-DD a Date (sin zona horaria)
  const stringToDate = useCallback((dateStr: string): Date => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, []);

  // Sincronizar dateRange con selectedDates
  React.useEffect(() => {
    if (selectedDates.checkIn && selectedDates.checkOut) {
      setDateRange({
        from: stringToDate(selectedDates.checkIn),
        to: stringToDate(selectedDates.checkOut),
      });
    } else if (selectedDates.checkIn) {
      setDateRange({
        from: stringToDate(selectedDates.checkIn),
        to: undefined,
      });
    } else {
      setDateRange({ from: undefined, to: undefined });
    }
  }, [selectedDates.checkIn, selectedDates.checkOut, stringToDate]);

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

  const formatCurrency =
    currencyCode === "PEN"
      ? "S/"
      : currencyCode === "USD"
        ? "$"
        : `${currencyCode} `;

  const formatCurrencyValue = (value: number) =>
    `${formatCurrency}${value.toLocaleString("es-PE")}`;

  // Calculos de precios

  const nightsCount = getNightCount();

  const totalPrice = calculateTotalPrice();

  const serviceFee = Math.round(totalPrice * 0.14);

  const grandTotal = totalPrice + serviceFee;

  // Validacion de huespedes

  const handleGuestsChange = (newGuests: GuestCounts) => {
    onDatesChange({ ...selectedDates, guests: newGuests });
  };

  const getGuestSummary = () => {
    const { adults, children, babies, pets } = selectedDates.guests;
    const parts: string[] = [];

    if (adults > 0) parts.push(`${adults} adulto${adults !== 1 ? "s" : ""}`);
    if (children > 0)
      parts.push(`${children} niño${children !== 1 ? "s" : ""}`);
    if (babies > 0) parts.push(`${babies} bebé${babies !== 1 ? "s" : ""}`);
    if (pets > 0) parts.push(`${pets} mascota${pets !== 1 ? "s" : ""}`);

    return parts.length > 0 ? parts.join(", ") : "Agregar huéspedes";
  };

  const canReserve =
    selectedDates.checkIn && selectedDates.checkOut && nightsCount > 0;

  // Crear un Set de fechas disponibles para búsqueda O(1)
  const availableDatesSet = useMemo(() => {
    return new Set(availability.filter((d) => d.available).map((d) => d.date));
  }, [availability]);

  // Función para verificar si una fecha está disponible (optimizada)
  const isDateAvailable = useCallback(
    (date: Date) => {
      const dateStr = dateToString(date);
      return availableDatesSet.has(dateStr);
    },
    [availableDatesSet, dateToString]
  );

  // Función para deshabilitar fechas no disponibles (memoizada)
  const disabledDays = useCallback(
    (date: Date) => {
      return !isDateAvailable(date);
    },
    [isDateAvailable]
  );

  // Memoizar el handler de selección para evitar re-renders
  const handleRangeSelect = useCallback(
    (range: { from?: Date; to?: Date } | undefined) => {
      if (range?.from) {
        const checkIn = dateToString(range.from);

        // Verificar si from y to son la misma fecha
        if (range.to) {
          const checkOut = dateToString(range.to);

          // Si from y to son iguales, solo es la primera selección
          if (checkIn === checkOut) {
            onDatesChange({
              ...selectedDates,
              checkIn,
              checkOut: "",
            });
          } else {
            // Fechas diferentes - rango completo
            onDatesChange({
              ...selectedDates,
              checkIn,
              checkOut,
            });
            setCalendarOpen(false);
          }
        } else {
          // Solo from, sin to
          onDatesChange({
            ...selectedDates,
            checkIn,
            checkOut: "",
          });
        }
      } else {
        // Si se deselecciona todo, limpiar
        onDatesChange({
          ...selectedDates,
          checkIn: "",
          checkOut: "",
        });
      }
    },
    [selectedDates, onDatesChange, dateToString]
  );

  return (
    <div className={`sticky top-24 ${className}`}>
      <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-lg">
        {/* Precio y rating */}

        <div className="mb-6">
          <div className="mb-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold">
              {formatCurrencyValue(basePriceNight)}
            </span>

            <span className="text-gray-600">/ noche</span>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

            <span className="font-medium">
              {typeof averageRating === "number"
                ? averageRating.toFixed(1)
                : "0.0"}
            </span>

            <span className="text-gray-600">
              ({typeof totalReviews === "number" ? totalReviews : 0} resenas)
            </span>
          </div>
        </div>

        {/* Formulario de fechas */}
        <div className="mb-6 space-y-4">
          {/* Calendario de rango */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button className="w-full cursor-pointer rounded-lg border border-gray-300 text-left transition-colors hover:border-gray-400">
                <div className="grid grid-cols-2 gap-0">
                  <div className="border-r border-gray-300 p-3">
                    <label className="mb-1 block cursor-pointer text-center text-xs font-medium text-gray-700">
                      LLEGADA
                    </label>
                    <div className="flex cursor-pointer items-center justify-center gap-2 text-sm">
                      <CalendarIcon className="h-4 w-4" />
                      {selectedDates.checkIn
                        ? format(
                            stringToDate(selectedDates.checkIn),
                            "dd/MM/yyyy",
                            { locale: es }
                          )
                        : "Agregar fecha"}
                    </div>
                  </div>
                  <div className="p-3">
                    <label className="mb-1 block cursor-pointer text-center text-xs font-medium text-gray-700">
                      SALIDA
                    </label>
                    <div className="flex cursor-pointer items-center justify-center gap-2 text-sm">
                      <CalendarIcon className="h-4 w-4" />
                      {selectedDates.checkOut
                        ? format(
                            stringToDate(selectedDates.checkOut),
                            "dd/MM/yyyy",
                            { locale: es }
                          )
                        : "Agregar fecha"}
                    </div>
                  </div>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 [&_button]:cursor-pointer"
              align="center"
              side="bottom"
              sideOffset={4}
            >
              <div>
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleRangeSelect}
                  disabled={disabledDays}
                  fromDate={today}
                  toDate={threeMonthsLater}
                  numberOfMonths={2}
                  locale={es}
                />
                {(selectedDates.checkIn || selectedDates.checkOut) && (
                  <div className="border-t border-gray-200 p-3">
                    <button
                      onClick={() => {
                        onDatesChange({
                          ...selectedDates,
                          checkIn: "",
                          checkOut: "",
                        });
                      }}
                      className="w-full cursor-pointer text-sm text-gray-600 underline hover:text-gray-900"
                    >
                      Limpiar fechas
                    </button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {propertyOccupied && (
            <div>
              <p className="text-sm text-red-600">
                Este recinto ya está ocupado en las fechas seleccionadas, por
                favor, elija otras fechas.
              </p>
            </div>
          )}

          <div className="relative" ref={guestPopoverRef}>
            <button
              type="button"
              onClick={() => setGuestPopoverOpen(!guestPopoverOpen)}
              className="w-full cursor-pointer rounded-lg border border-gray-300 p-3 text-left transition-colors hover:border-gray-400"
            >
              <label className="mb-1 block cursor-pointer text-xs font-medium text-gray-700">
                HUÉSPEDES
              </label>
              <div className="flex cursor-pointer items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span>{getGuestSummary()}</span>
              </div>
            </button>
            {guestPopoverOpen && (
              <GuestPopover
                counts={selectedDates.guests}
                onChange={handleGuestsChange}
                maxGuests={maxGuests}
              />
            )}
          </div>
          {(selectedDates.checkIn || selectedDates.checkOut) && (
            <div className="border-t border-gray-200 p-3">
              <button
                onClick={() => {
                  onDatesChange({
                    ...selectedDates,
                    checkIn: "",
                    checkOut: "",
                  });
                }}
                className="w-full cursor-pointer text-sm text-gray-600 underline hover:text-gray-900"
              >
                Limpiar fechas
              </button>
            </div>
          )}
        </div>

        {/* Boton de reserva */}

        <Button
          className="mb-4 w-full"
          size="lg"
          disabled={!canReserve}
          onClick={onReserve}
        >
          {canReserve ? "Reservar" : "Selecciona fechas"}
        </Button>

        <p className="mb-4 text-center text-sm text-gray-600">
          No se realizara ningun cargo todavia
        </p>

        {/* Desglose de precios */}

        {canReserve && (
          <div className="space-y-3 border-t border-gray-200 pt-4">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {formatCurrencyValue(basePriceNight)} x {nightsCount} noche
                {nightsCount > 1 ? "s" : ""}
              </span>

              <span>{formatCurrencyValue(totalPrice)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Tarifa de servicio</span>

              <span>{formatCurrencyValue(serviceFee)}</span>
            </div>

            <div className="flex justify-between border-t border-gray-200 pt-3 font-medium">
              <span>Total</span>

              <span>{formatCurrencyValue(grandTotal)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
