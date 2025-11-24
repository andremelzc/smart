import { useState, useEffect } from "react";
import { bookingService } from "@/src/services/booking.service";
import type { HostBooking } from "@/src/services/booking.service";

interface UseHostBookingsReturn {
  bookings: HostBooking[];
  loading: boolean;
  error: string | null;
  refreshBookings: () => Promise<void>;
  totalRevenue: number;
  bookingCounts: Record<string, number>;
}

export function useHostBookings(): UseHostBookingsReturn {
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getHostBookings();
      setBookings(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al cargar las reservas del host";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshBookings = async () => {
    await fetchBookings();
  };

  // Calcular métricas derivadas
  const totalRevenue = bookingService.calculateTotalRevenue(bookings);
  const bookingCounts = bookingService.getBookingCounts(bookings);

  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    loading,
    error,
    refreshBookings,
    totalRevenue,
    bookingCounts,
  };
}
