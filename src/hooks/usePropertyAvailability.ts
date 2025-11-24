import { useState, useEffect } from "react";

/**
 * Tipos de disponibilidad
 */
export interface AvailabilityDay {
  date: string; // YYYY-MM-DD
  available: boolean;
  reason: "available" | "booked" | "blocked" | "maintenance";
}

export interface AvailabilitySummary {
  totalDays: number;
  availableDays: number;
  bookedDays: number;
  blockedDays: number;
  maintenanceDays: number;
}

interface UsePropertyAvailabilityReturn {
  availability: AvailabilityDay[];
  summary: AvailabilitySummary | null;
  isLoading: boolean;
  error: string | null;
  checkDateRange: (checkin: Date, checkout: Date) => Promise<boolean>;
  isCheckingRange: boolean;
  refetch: () => void;
}

/**
 * Hook para gestionar la disponibilidad de una propiedad
 *
 * @param propertyId - ID de la propiedad
 * @param startDate - Fecha inicial (default: hoy)
 * @param endDate - Fecha final (default: hoy + 90 días)
 *
 * @example
 * ```tsx
 * const { availability, summary, isLoading, checkDateRange } =
 *   usePropertyAvailability(propertyId, new Date(), futureDate);
 * ```
 */
export function usePropertyAvailability(
  propertyId: number,
  startDate?: Date,
  endDate?: Date
): UsePropertyAvailabilityReturn {
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [summary, setSummary] = useState<AvailabilitySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingRange, setIsCheckingRange] = useState(false);

  // Convertir fechas a strings para dependencias estables
  const startDateStr = startDate?.toISOString() ?? "";
  const endDateStr = endDate?.toISOString() ?? "";

  /**
   * Formatear fecha a YYYY-MM-DD
   */
  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  /**
   * Fetch de disponibilidad
   */
  const fetchAvailability = async () => {
    if (!propertyId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Usar las fechas pasadas o crear defaults
      const start = startDate || new Date();
      const end = endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

      const params = new URLSearchParams({
        startDate: formatDate(start),
        endDate: formatDate(end),
      });

      const response = await fetch(
        `/api/properties/${propertyId}/availability?${params}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener disponibilidad");
      }

      const data = await response.json();

      if (data.success) {
        setAvailability(data.data);
        setSummary({
          totalDays: data.meta.totalDays,
          availableDays: data.meta.availableDays,
          bookedDays: data.meta.bookedDays,
          blockedDays: data.meta.blockedDays,
          maintenanceDays: data.meta.maintenanceDays,
        });
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar disponibilidad"
      );
      console.error("Error fetching availability:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verificar si un rango de fechas está disponible
   */
  const checkDateRange = async (
    checkin: Date,
    checkout: Date
  ): Promise<boolean> => {
    if (!propertyId) return false;

    setIsCheckingRange(true);

    try {
      const response = await fetch(
        `/api/properties/${propertyId}/availability`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            checkinDate: formatDate(checkin),
            checkoutDate: formatDate(checkout),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al verificar disponibilidad");
      }

      const data = await response.json();
      return data.success && data.available;
    } catch (err) {
      console.error("Error checking date range:", err);
      return false;
    } finally {
      setIsCheckingRange(false);
    }
  };

  /**
   * Refetch manual
   */
  const refetch = () => {
    fetchAvailability();
  };

  // Cargar disponibilidad al montar o cambiar fechas/propertyId
  useEffect(() => {
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, startDateStr, endDateStr]);

  return {
    availability,
    summary,
    isLoading,
    error,
    checkDateRange,
    isCheckingRange,
    refetch,
  };
}
