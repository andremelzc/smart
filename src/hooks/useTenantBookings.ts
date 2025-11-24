import { useState, useEffect } from "react";
import { bookingService } from "@/src/services/booking.service";
import type { TenantBooking } from "@/src/services/booking.service";

interface UseTenantBookingsReturn {
  bookings: TenantBooking[];
  loading: boolean;
  error: string | null;
  refreshBookings: () => Promise<void>;
}

export function useTenantBookings(): UseTenantBookingsReturn {
  const [bookings, setBookings] = useState<TenantBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getTenantBookings();
      setBookings(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar las reservas";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshBookings = async () => {
    await fetchBookings();
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    loading,
    error,
    refreshBookings,
  };
}
