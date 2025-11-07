"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Filter,
  ChevronRight,
  Hotel,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useTenantBookings } from "@/src/hooks/useTenantBookings";
import { bookingService } from "@/src/services/booking.service";
import type { TenantBooking } from "@/src/services/booking.service";

type ReservationStatus = "current" | "upcoming" | "past" | "cancelled";

// Función para determinar el estado de una reserva basado en las fechas
const getBookingStatus = (checkinDate: string, checkoutDate: string, dbStatus: string): ReservationStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkin = new Date(checkinDate);
  checkin.setHours(0, 0, 0, 0);
  
  const checkout = new Date(checkoutDate);
  checkout.setHours(0, 0, 0, 0);

  // Si está cancelado en la BD, es cancelado
  if (dbStatus.toLowerCase() === 'cancelled') {
    return 'cancelled';
  }

  // Si hoy está entre checkin y checkout, está en curso
  if (today >= checkin && today < checkout) {
    return 'current';
  }

  // Si checkin es futuro, es próxima
  if (checkin > today) {
    return 'upcoming';
  }

  // Si checkout es pasado, es finalizada
  return 'past';
};

const statusStyles: Record<
  ReservationStatus,
  { label: string; badge: string; dot: string }
> = {
  current: {
    label: "En curso",
    badge: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  upcoming: {
    label: "Próxima",
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
    dot: "bg-blue-500",
  },
  past: {
    label: "Finalizada",
    badge: "bg-gray-100 text-gray-700 border border-gray-200",
    dot: "bg-gray-400",
  },
  cancelled: {
    label: "Cancelada",
    badge: "bg-red-100 text-red-700 border border-red-200",
    dot: "bg-red-500",
  },
};

const filterSegments: Array<{ key: "all" | ReservationStatus; label: string }> =
  [
    { key: "all", label: "Todas" },
    { key: "current", label: "En curso" },
    { key: "upcoming", label: "Próximas" },
    { key: "past", label: "Pasadas" },
    { key: "cancelled", label: "Canceladas" },
  ];

const formatRange = (checkIn: string, checkOut: string) => {
  const formatter = new Intl.DateTimeFormat("es-PE", {
    month: "short",
    day: "numeric",
  });

  return `${formatter.format(new Date(checkIn))} - ${formatter.format(
    new Date(checkOut),
  )}`;
};

export default function ReservationsPage() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | ReservationStatus>("all");
  const { bookings, loading, error, refreshBookings } = useTenantBookings();

  // Convertir los bookings de la BD al formato de la UI
  const reservations = useMemo(() => {
    const formattedBookings = bookings.map((booking: TenantBooking) => {
      const status = getBookingStatus(booking.checkinDate, booking.checkoutDate, booking.status);
      
      return {
        id: `RES-${booking.bookingId}`,
        propertyName: booking.title,
        location: `${booking.city}, ${booking.stateRegion}`,
        checkIn: booking.checkinDate,
        checkOut: booking.checkoutDate,
        guests: booking.guestCount,
        status,
        hostName: bookingService.getHostFullName(booking),
        price: bookingService.formatCurrency(booking.totalAmount),
        notes: booking.hostNote || "Sin notas adicionales del anfitrión.",
        imageUrl: booking.imageUrl,
      };
    });

    if (selectedFilter === "all") {
      return formattedBookings;
    }

    return formattedBookings.filter(
      (reservation) => reservation.status === selectedFilter,
    );
  }, [bookings, selectedFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando reservas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Error al cargar reservas</h3>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={refreshBookings}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">
          Mis reservas
        </h1>
        <p className="text-gray-600">
          Consulta el estado de tus viajes, encuentra detalles clave y mantén
          todo organizado desde un solo lugar.
        </p>
      </header>

      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-700">
            Filtrar por estado:
          </span>
          <div className="flex flex-wrap gap-2">
            {filterSegments.map((segment) => {
              const isSelected = selectedFilter === segment.key;

              return (
                <button
                  key={segment.key}
                  onClick={() => setSelectedFilter(segment.key)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-blue-light-100 text-blue-light-700 border border-blue-light-300"
                      : "text-gray-600 hover:bg-gray-100 border border-transparent"
                  }`}
                >
                  {segment.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {reservations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <Clock className="h-10 w-10 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedFilter === "all" 
                ? "No tienes reservas" 
                : "No hay reservas bajo este filtro"
              }
            </h3>
            <p className="text-sm text-gray-600">
              {selectedFilter === "all"
                ? "Cuando hagas una reserva, aparecerá aquí."
                : "Cambia el estado seleccionado o realiza una nueva reserva para verla aquí."
              }
            </p>
          </div>
        ) : (
          reservations.map((reservation) => {
            const statusInfo = statusStyles[reservation.status];

            return (
              <article
                key={reservation.id}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-1 items-start gap-4">
                    <div className="hidden h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl lg:block">
                      {reservation.imageUrl ? (
                        <Image
                          src={reservation.imageUrl}
                          alt={reservation.propertyName}
                          width={96}
                          height={96}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-blue-light-50 text-blue-light-500">
                          <Hotel className="h-10 w-10" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            {reservation.propertyName}
                          </h2>
                          <p className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-blue-light-500" />
                            {reservation.location}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.badge}`}
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${statusInfo.dot}`}
                          />
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {formatRange(reservation.checkIn, reservation.checkOut)}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          {reservation.guests}{" "}
                          {reservation.guests === 1 ? "huésped" : "huéspedes"}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          Check-in:{" "}
                          {new Date(reservation.checkIn).toLocaleTimeString(
                            "es-PE",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}{" "}
                          / Check-out:{" "}
                          {new Date(reservation.checkOut).toLocaleTimeString(
                            "es-PE",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>

                      <div className="grid gap-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <span>
                            Anfitrión:{" "}
                            <span className="font-medium text-gray-900">
                              {reservation.hostName}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-blue-light-500" />
                          <span>
                            Código de reserva:{" "}
                            <span className="font-medium text-gray-900">
                              {reservation.id}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-blue-light-500" />
                          <span>
                            Total pagado:{" "}
                            <span className="font-semibold text-gray-900">
                              {reservation.price}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="mt-0.5 h-4 w-4 text-blue-light-500" />
                          <span>{reservation.notes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
