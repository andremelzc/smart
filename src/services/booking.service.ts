// Types
export interface TenantBooking {
  bookingId: number;
  propertyId: number;
  checkinDate: string;
  checkoutDate: string;
  status: string;
  guestCount: number;
  title: string;
  formattedAddress: string;
  city: string;
  stateRegion: string;
  country: string;
  totalAmount: number;
  hostFirstName: string;
  hostLastName: string;
  hostNote: string | null;
  imageUrl: string | null;
}

export interface HostBooking {
  bookingId: number;
  checkinDate: string;
  checkoutDate: string;
  status: string;
  guestCount: number;
  totalAmount: number;
  propertyTitle: string;
  tenantFirstName: string;
  tenantLastName: string;
  imageUrl: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

import { formatFullName } from '@/src/lib/formatters';

/**
 * Servicio de operaciones de reservas
 */
export const bookingService = {
  /**
   * Obtiene todas las reservas del tenant autenticado
   * @returns Promise con las reservas del tenant
   */
  getTenantBookings: async (): Promise<TenantBooking[]> => {
    try {
      const response = await fetch("/api/bookings/tenant", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: ApiResponse<TenantBooking[]> = await response.json();
      console.log("📅 Reservas del tenant obtenidas:", data);

      if (!response.ok) {
        throw new Error(data.error || "Error al obtener las reservas");
      }

      return data.data || [];
    } catch (error: unknown) {
      console.error("❌ Error en getTenantBookings:", error);
      const errorMessage = error instanceof Error ? error.message : "Error de conexión";
      throw new Error(errorMessage);
    }
  },

  /**
   * Formatea una fecha para mostrar
   * @param dateString - Fecha en formato string
   * @returns Fecha formateada
   */
  formatDate: (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  },

  /**
   * Obtiene el nombre completo del host formateado correctamente
   * @param booking - Reserva con datos del host
   * @returns Nombre completo del host formateado (ej: "Andre Melendez")
   */
  getHostFullName: (booking: TenantBooking): string => {
    return formatFullName(booking.hostFirstName, booking.hostLastName);
  },

  /**
   * Obtiene la dirección completa de la propiedad
   * @param booking - Reserva con datos de la propiedad
   * @returns Dirección completa formateada
   */
  getFullAddress: (booking: TenantBooking): string => {
    const parts = [booking.formattedAddress, booking.city, booking.stateRegion, booking.country];
    return parts.filter(part => part && part.trim()).join(', ');
  },

  /**
   * Calcula la duración de la estadía en días
   * @param checkinDate - Fecha de check-in
   * @param checkoutDate - Fecha de check-out
   * @returns Número de días de estadía
   */
  calculateStayDuration: (checkinDate: string, checkoutDate: string): number => {
    try {
      const checkin = new Date(checkinDate);
      const checkout = new Date(checkoutDate);
      const diffTime = checkout.getTime() - checkin.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(1, diffDays); // Mínimo 1 día
    } catch {
      return 1;
    }
  },

  /**
   * Formatea el monto total como moneda
   * @param amount - Monto a formatear
   * @returns Monto formateado como moneda
   */
  formatCurrency: (amount: number): string => {
    try {
      return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
      }).format(amount);
    } catch {
      return `S/ ${amount.toFixed(2)}`;
    }
  },

  /**
   * Obtiene el color del estado de la reserva para UI
   * @param status - Estado de la reserva
   * @returns Clase CSS para el color del estado
   */
  getStatusColor: (status: string): string => {
    const statusColors: Record<string, string> = {
      'confirmed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800',
      'completed': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800'
    };
    return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  },

  /**
   * Traduce el estado de la reserva al español
   * @param status - Estado en inglés
   * @returns Estado traducido al español
   */
  translateStatus: (status: string): string => {
    const statusTranslations: Record<string, string> = {
      'confirmed': 'Confirmada',
      'pending': 'Pendiente',
      'cancelled': 'Cancelada',
      'completed': 'Completada',
      'in-progress': 'En curso'
    };
    return statusTranslations[status.toLowerCase()] || status;
  },

  // === FUNCIONES ESPECÍFICAS PARA HOST ===

  /**
   * Obtiene todas las reservas del host autenticado
   * @returns Promise con las reservas donde el usuario es anfitrión
   */
  getHostBookings: async (): Promise<HostBooking[]> => {
    try {
      const response = await fetch("/api/bookings/host", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: ApiResponse<HostBooking[]> = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al obtener las reservas del host");
      }

      return data.data || [];
    } catch (error: unknown) {
      console.error("❌ Error en getHostBookings:", error);
      const errorMessage = error instanceof Error ? error.message : "Error de conexión";
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene el nombre completo del huésped (tenant) formateado correctamente
   * @param booking - Reserva con datos del huésped
   * @returns Nombre completo del huésped formateado (ej: "Maria Lopez")
   */
  getTenantFullName: (booking: HostBooking): string => {
    return formatFullName(booking.tenantFirstName, booking.tenantLastName);
  },

  /**
   * Calcula el total de ingresos de un array de reservas
   * @param bookings - Array de reservas
   * @returns Total de ingresos
   */
  calculateTotalRevenue: (bookings: HostBooking[]): number => {
    return bookings.reduce((total, booking) => {
      // Solo contar reservas confirmadas y completadas
      if (['confirmed', 'completed'].includes(booking.status.toLowerCase())) {
        return total + booking.totalAmount;
      }
      return total;
    }, 0);
  },

  /**
   * Cuenta las reservas por estado
   * @param bookings - Array de reservas
   * @returns Objeto con contadores por estado
   */
  getBookingCounts: (bookings: HostBooking[]): Record<string, number> => {
    const counts = {
      total: bookings.length,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      completed: 0,
      'in-progress': 0
    };

    bookings.forEach(booking => {
      const status = booking.status.toLowerCase();
      if (status in counts) {
        counts[status as keyof typeof counts]++;
      }
    });

    return counts;
  }
};