"use client";

import { useCallback, useMemo, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";
import { format } from "date-fns";

interface DatePopoverProps {
  checkIn?: string;
  checkOut?: string;
  onChange: (next: { checkIn?: string; checkOut?: string }) => void;
  onClear?: () => void;
}

export function DatePopover({
  checkIn,
  checkOut,
  onChange,
  onClear,
}: DatePopoverProps) {
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

  // Estado del rango de fechas para el calendario
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>(() => {
    if (checkIn && checkOut) {
      return {
        from: stringToDate(checkIn),
        to: stringToDate(checkOut),
      };
    } else if (checkIn) {
      return {
        from: stringToDate(checkIn),
        to: undefined,
      };
    }
    return { from: undefined, to: undefined };
  });

  // Memoizar fechas límite
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const threeMonthsLater = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 90);
    return date;
  }, []);

  // Handler para selección de rango
  const handleRangeSelect = useCallback(
    (range: { from?: Date; to?: Date } | undefined) => {
      if (range?.from) {
        const checkInStr = dateToString(range.from);

        if (range.to) {
          const checkOutStr = dateToString(range.to);

          // Si from y to son iguales, solo es la primera selección
          if (checkInStr === checkOutStr) {
            setDateRange({ from: range.from, to: undefined });
            onChange({ checkIn: checkInStr, checkOut: undefined });
          } else {
            // Fechas diferentes - rango completo
            setDateRange({ from: range.from, to: range.to });
            onChange({ checkIn: checkInStr, checkOut: checkOutStr });
          }
        } else {
          // Solo from, sin to
          setDateRange({ from: range.from, to: undefined });
          onChange({ checkIn: checkInStr, checkOut: undefined });
        }
      } else {
        // Si se deselecciona todo, limpiar
        setDateRange({ from: undefined, to: undefined });
        onChange({ checkIn: undefined, checkOut: undefined });
      }
    },
    [onChange, dateToString]
  );

  const handleClear = () => {
    setDateRange({ from: undefined, to: undefined });
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="border-blue-light-200 absolute top-[calc(100%+0.75rem)] left-1/2 z-30 w-full max-w-2xl -translate-x-1/2 rounded-3xl border bg-white p-5 shadow-xl">
      <div className="flex items-start gap-4">
        <CalendarIcon className="text-blue-light-500 mt-1 h-5 w-5" />

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-dark-700 text-sm font-semibold">
                Selecciona tus fechas
              </p>

              <p className="text-gray-dark-500 text-xs">
                Elige la fecha de llegada y salida para planificar tu estadia.
              </p>
            </div>

            {(checkIn || checkOut) && (
              <button
                type="button"
                onClick={handleClear}
                className="text-blue-light-600 hover:text-blue-light-700 text-xs font-medium underline"
              >
                Limpiar fechas
              </button>
            )}
          </div>

          <div className="flex items-center justify-center">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleRangeSelect}
              fromDate={today}
              toDate={threeMonthsLater}
              numberOfMonths={2}
              locale={es}
              className="[&_button]:cursor-pointer"
            />
          </div>

          {checkIn && checkOut && (
            <div className="border-blue-light-150 bg-blue-light-50 rounded-2xl border p-3 text-center">
              <p className="text-gray-dark-600 text-sm">
                <span className="font-medium">
                  {format(stringToDate(checkIn), "dd/MM/yyyy", { locale: es })}
                </span>
                {" → "}
                <span className="font-medium">
                  {format(stringToDate(checkOut), "dd/MM/yyyy", { locale: es })}
                </span>
              </p>
            </div>
          )}

          <p className="text-gray-dark-400 text-xs">
            Selecciona un rango de fechas para tu búsqueda. Los cambios se aplicarán automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
