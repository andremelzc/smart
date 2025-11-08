"use client";

import { useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  MessageCircle,
} from "lucide-react";
import { useTenantBookings } from "@/src/hooks/useTenantBookings";
import { bookingService } from "@/src/services/booking.service";
import type { TenantBooking } from "@/src/services/booking.service";
import { Button } from "@/src/components/ui/Button";

type ReservationStatus = "current" | "upcoming" | "past" | "cancelled";

// Funcion para determinar el estado de una reserva basado en las fechas

const getBookingStatus = (
  checkinDate: string,
  checkoutDate: string,
  dbStatus: string
): ReservationStatus => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const checkin = new Date(checkinDate);

  checkin.setHours(0, 0, 0, 0);

  const checkout = new Date(checkoutDate);

  checkout.setHours(0, 0, 0, 0);

  // Si esta cancelado en la BD, es cancelado

  if (dbStatus.toLowerCase() === "cancelled") {
    return "cancelled";
  }

  // Si hoy esta entre checkin y checkout, esta en curso

  if (today >= checkin && today < checkout) {
    return "current";
  }

  // Si checkin es futuro, es proxima

  if (checkin > today) {
    return "upcoming";
  }

  // Si checkout es pasado, es finalizada

  return "past";
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
    label: "Proxima",

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
    { key: "upcoming", label: "Proximas" },
    { key: "past", label: "Pasadas" },
    { key: "cancelled", label: "Canceladas" },
  ];

type FormattedReservation = {
  id: string;
  propertyName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: ReservationStatus;
  hostName: string;
  price: string;
  notes: string;
  imageUrl?: string;
};

const CHAT_STORAGE_KEY = "smart-guest-chats";

const formatRange = (checkIn: string, checkOut: string) => {
  const formatter = new Intl.DateTimeFormat("es-PE", {
    month: "short",
    day: "numeric",
  });

  return `${formatter.format(new Date(checkIn))} - ${formatter.format(
    new Date(checkOut)
  )}`;
};

export default function ReservationsPage() {
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | ReservationStatus
  >("all");
  const { bookings, loading, error, refreshBookings } = useTenantBookings();
  const router = useRouter();
  const createChatForReservation = useCallback(
    (reservation: FormattedReservation) => {
      if (typeof window === "undefined") {
        return;
      }

      const safeParse = (raw: string | null) => {
        if (!raw) return [];
        try {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      };

      const chatStatus =
        reservation.status === "current" || reservation.status === "past"
          ? "confirmed"
          : "pending";

      const baseMessage = `Hola ${
        reservation.hostName.split(" ")[0] || "anfitrion"
      }, me gustaria coordinar detalles sobre ${reservation.propertyName}.`;
      const chatId = `CHAT-${reservation.id}`;

      const conversation = {
        id: chatId,
        reservationId: reservation.id,
        hostName: reservation.hostName,
        propertyName: reservation.propertyName,
        location: reservation.location,
        autoCreatedAt: new Date().toISOString(),
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        guests: reservation.guests,
        status: chatStatus,
        messages: [
          {
            id: `guest-${Date.now()}`,
            sender: "guest" as const,
            content: baseMessage,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const existing = safeParse(window.localStorage.getItem(CHAT_STORAGE_KEY));
      const updated = [
        conversation,
        ...existing.filter(
          (item: { reservationId?: string }) =>
            item.reservationId !== reservation.id
        ),
      ];

      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
    },
    []
  );

  const handleChatClick = useCallback(
    (reservation: FormattedReservation) => {
      createChatForReservation(reservation);
      router.push(`/account/messages?reservationId=${reservation.id}`);
    },
    [createChatForReservation, router]
  );

  // Convertir los bookings de la BD al formato de la UI
  const reservations = useMemo<FormattedReservation[]>(() => {
    const formattedBookings: FormattedReservation[] = bookings.map(
      (booking: TenantBooking) => {
        const status = getBookingStatus(
          booking.checkinDate,
          booking.checkoutDate,
          booking.status
        );

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

          notes: booking.hostNote || "Sin notas adicionales del anfitrion.",

          imageUrl: booking.imageUrl ?? undefined,
        };
      }
    );

    if (selectedFilter === "all") {
      return formattedBookings;
    }

    return formattedBookings.filter(
      (reservation) => reservation.status === selectedFilter
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
            <h3 className="font-semibold text-red-900">
              Error al cargar reservas
            </h3>

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
        <h1 className="text-2xl font-semibold text-gray-900">Mis reservas</h1>

        <p className="text-gray-600">
          Consulta el estado de tus viajes, encuentra detalles clave y manten
          todo organizado desde un solo lugar.
        </p>
      </header>

      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <Filter className="h-4 w-4 text-gray-500" />

          <span className="font-medium text-gray-700">Filtrar por estado:</span>

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
                : "No hay reservas bajo este filtro"}
            </h3>

            <p className="text-sm text-gray-600">
              {selectedFilter === "all"
                ? "Cuando hagas una reserva, aparecera aqui."
                : "Cambia el estado seleccionado o realiza una nueva reserva para verla aqui."}
            </p>
          </div>
        ) : (
          reservations.map((reservation) => {
            const statusInfo = statusStyles[reservation.status];
            const canStartChat =
              reservation.status === "current" ||
              reservation.status === "upcoming";

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

                          {formatRange(
                            reservation.checkIn,
                            reservation.checkOut
                          )}
                        </span>

                        <span className="inline-flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          {reservation.guests}{" "}
                          {reservation.guests === 1 ? "huesped" : "huespedes"}
                        </span>

                        <span className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          Check-in:{" "}
                          {new Date(reservation.checkIn).toLocaleTimeString(
                            "es-PE",

                            {
                              hour: "2-digit",

                              minute: "2-digit",
                            }
                          )}{" "}
                          / Check-out:{" "}
                          {new Date(reservation.checkOut).toLocaleTimeString(
                            "es-PE",

                            {
                              hour: "2-digit",

                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>

                      <div className="grid gap-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />

                          <span>
                            Anfitrion:{" "}
                            <span className="font-medium text-gray-900">
                              {reservation.hostName}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-blue-light-500" />

                          <span>
                            Codigo de reserva:{" "}
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

                <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
                  {canStartChat && (
                    <Button
                      variant="ghost"
                      leftIcon={MessageCircle}
                      onClick={() => handleChatClick(reservation)}
                    >
                      Chat con anfitrion
                    </Button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
