// src/lib/services/hostAvailability.service.ts

/**
 * Tipo alineado con lo que devuelve PropertyAvailabilityService
 * pero adaptado para el calendario del host
 */
export type HostCalendarDay = {
  date: string; // "YYYY-MM-DD"
  available: boolean;
  reason: 'available' | 'booked' | 'blocked' | 'maintenance' | 'special';
  price: number | null; // Precio específico o null (usará base price)
};

export type SetAvailabilityParams = {
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  kind: "blocked" | "maintenance" | "special";
  pricePerNight?: number | null; // Para precios especiales
};

export type SetAvailabilityResponse = {
  success: boolean;
  message?: string;
};

export const hostAvailabilityService = {
  getCalendar: async (
    propertyId: string | number,
    month: number,
    year: number
  ): Promise<HostCalendarDay[]> => {
    const apiUrl = `/api/host/properties/${propertyId}/availability?month=${
      month + 1
    }&year=${year}`;

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al obtener el calendario");
      }

      return await response.json();
    } catch (error: unknown) {
      console.error("❌ Error en hostAvailabilityService.getCalendar:", error);
      throw error instanceof Error ? error : new Error("Error de conexión");
    }
  },

  setAvailability: async (
    propertyId: string | number,
    params: SetAvailabilityParams
  ): Promise<SetAvailabilityResponse> => {
    const apiUrl = `/api/host/properties/${propertyId}/availability`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al guardar la disponibilidad");
      }

      return data;
    } catch (error: unknown) {
      console.error("❌ Error en hostAvailabilityService.setAvailability:", error);
      throw error instanceof Error ? error : new Error("Error de conexión");
    }
  },

  /**
   * Elimina un ajuste de disponibilidad (bloqueo, mantenimiento o precio especial)
   */
  removeAvailability: async (
    propertyId: string | number,
    startDate: string,
    endDate: string
  ): Promise<SetAvailabilityResponse> => {
    const apiUrl = `/api/host/properties/${propertyId}/availability`;

    try {
      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al eliminar el ajuste de disponibilidad");
      }

      return data;
    } catch (error: unknown) {
      console.error("❌ Error en hostAvailabilityService.removeAvailability:", error);
      throw error instanceof Error ? error : new Error("Error de conexión");
    }
  },
};