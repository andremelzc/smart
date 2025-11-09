"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useTenantBookings } from "@/src/hooks/useTenantBookings";
import { bookingService } from "@/src/services/booking.service";
import type { TenantBooking } from "@/src/services/booking.service";
import {
  GuestReservationCard,
  ReservationFilters,
  ReservationEmptyState,
  type GuestReservation,
  type FilterSegment,
} from "@/src/components/features/reservations";

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

const filterSegments: FilterSegment<"all" | ReservationStatus>[] = [
  { key: "all", label: "Todas" },
  { key: "current", label: "En curso" },
  { key: "upcoming", label: "Proximas" },
  { key: "past", label: "Pasadas" },
  { key: "cancelled", label: "Canceladas" },
];

type FormattedReservation = GuestReservation & {
  status: ReservationStatus;
};

const CHAT_STORAGE_KEY = "smart-guest-chats";



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
  const reservations = useMemo<GuestReservation[]>(() => {
    const formattedBookings: GuestReservation[] = bookings.map(
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

      <ReservationFilters
        title="Filtrar por estado"
        statusSegments={filterSegments}
        selectedStatus={selectedFilter}
        onStatusChange={setSelectedFilter}
      />

      <section className="space-y-4">
        {reservations.length === 0 ? (
          <ReservationEmptyState 
            variant="guest" 
            filterType={selectedFilter === "all" ? "all" : "filtered"} 
          />
        ) : (
          reservations.map((reservation) => {
            const canStartChat =
              reservation.status === "current" ||
              reservation.status === "upcoming";

            return (
              <GuestReservationCard
                key={reservation.id}
                reservation={reservation}
                statusConfig={statusStyles}
                onChatWithHost={(res) => handleChatClick(res as FormattedReservation)}
                canStartChat={canStartChat}
              />
            );
          })
        )}
      </section>
    </div>
  );
}
