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
import { LeaveReviewModal } from "@/src/components/reviews/LeaveReviewModal";
import { PreCancellationModal } from "@/src/components/features/reservations/PreCancellationModal";

type ReservationStatus = "pending" | "current" | "upcoming" | "past" | "cancelled";

// Orden de prioridad para mostrar reservas (menor = más importante)
const STATUS_PRIORITY: Record<ReservationStatus, number> = {
  pending: 1,    // ⚠️ Requiere atención
  current: 2,    // 🟢 En curso ahora
  upcoming: 3,   // 📅 Próximas
  past: 4,       // ✅ Finalizadas
  cancelled: 5,  // ❌ Canceladas
};

const getBookingStatus = (
  checkinDate: string,
  checkoutDate: string,
  dbStatus: string | null | undefined
): ReservationStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkin = new Date(checkinDate);
  checkin.setHours(0, 0, 0, 0);

  const checkout = new Date(checkoutDate);
  checkout.setHours(0, 0, 0, 0);

  const normalizedStatus = (dbStatus || "PENDING").toUpperCase();

  // Prioridad 1: Estados terminales de BD
  if (normalizedStatus === "CANCELLED" || normalizedStatus === "DECLINED") {
    return "cancelled";
  }

  if (normalizedStatus === "COMPLETED") {
    return "past";
  }

  // Prioridad 2: PENDING siempre se muestra como "pending" 
  // (independiente de fechas, porque requiere acción del anfitrión)
  if (normalizedStatus === "PENDING") {
    return "pending";
  }

  // Prioridad 3: ACCEPTED - usar lógica temporal
  if (today >= checkin && today < checkout) {
    return "current";
  }
  
  if (checkin > today) {
    return "upcoming";
  }
  
  // Checkout ya pasó pero sigue ACCEPTED (debería ser COMPLETED en BD)
  return "past";
};

const statusStyles: Record<
  ReservationStatus,
  { label: string; badge: string; dot: string }
> = {
  pending: {
    label: "Pendiente",
    badge: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    dot: "bg-yellow-500",
  },
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

const filterSegments: FilterSegment<"all" | ReservationStatus>[] = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendientes" },
  { key: "upcoming", label: "Próximas" },
  { key: "current", label: "En curso" },
  { key: "past", label: "Finalizadas" },
  { key: "cancelled", label: "Canceladas" },
];

type FormattedReservation = GuestReservation & {
  status: ReservationStatus;
};

const CHAT_STORAGE_KEY = "smart-guest-chats";

export default function ReservationsPage() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | ReservationStatus>("all");
  const { bookings, loading, error, refreshBookings } = useTenantBookings();
  const router = useRouter();

  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    bookingId: null as number | null,
    targetName: "",
    targetImage: undefined as string | undefined,
  });

  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    bookingId: null as number | null,
    totalAmount: 0,
    checkInDate: "",
    policyType: "flexible" as "flexible" | "moderate" | "strict",
  });

  const createChatForReservation = useCallback(
    (reservation: FormattedReservation) => {
      if (typeof window === "undefined") return;

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
        reservation.hostName.split(" ")[0] || "anfitrión"
      }, me gustaría coordinar detalles sobre ${reservation.propertyName}.`;
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

  const handleCancelReservation = useCallback(
    (reservation: GuestReservation) => {
      const bookingId = parseInt(reservation.id.replace("RES-", ""), 10);
      const booking = bookings.find((b) => b.bookingId === bookingId);

      if (booking) {
        setCancelModal({
          isOpen: true,
          bookingId: booking.bookingId,
          totalAmount: booking.totalAmount,
          checkInDate: booking.checkinDate,
          policyType: "flexible",
        });
      }
    },
    [bookings]
  );

  const handleConfirmCancel = useCallback(async () => {
    if (!cancelModal.bookingId) return;

    try {
      await bookingService.cancelBookingAsTenant(cancelModal.bookingId);
      setCancelModal((prev) => ({ ...prev, isOpen: false }));
      refreshBookings();
    } catch (error: unknown) {
      console.error("Error cancelando:", error);
      throw error;
    }
  }, [cancelModal.bookingId, refreshBookings]);

  const handleLeaveReview = useCallback((reservation: GuestReservation) => {
    const bookingId = parseInt(reservation.id.replace("RES-", ""), 10);

    setReviewModal({
      isOpen: true,
      bookingId: bookingId,
      targetName: reservation.propertyName,
      targetImage: reservation.imageUrl,
    });
  }, []);

  const handleSubmitReview = useCallback(
    async (rating: number, comment: string) => {
      if (!reviewModal.bookingId) return;

      console.log("📝 Enviando reseña:", {
        bookingId: reviewModal.bookingId,
        rating,
        comment,
      });
      // TODO: Implementar servicio de reseñas

      setReviewModal((prev) => ({ ...prev, isOpen: false }));
    },
    [reviewModal.bookingId]
  );

  // Convertir y ordenar reservas
  const reservations = useMemo<GuestReservation[]>(() => {
    const validBookings = bookings.filter(
      (booking: TenantBooking) =>
        booking.bookingId !== null &&
        booking.bookingId !== undefined &&
        !isNaN(booking.bookingId)
    );

    const formattedBookings: FormattedReservation[] = validBookings.map(
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
          dbStatus: booking.status,
          totalAmount: booking.totalAmount,
          hostName: bookingService.getHostFullName(booking),
          price: bookingService.formatCurrency(booking.totalAmount),
          notes: booking.hostNote || "Sin notas adicionales del anfitrión.",
          imageUrl: booking.imageUrl ?? undefined,
        };
      }
    );

    // Filtrar según selección
    let filtered = formattedBookings;
    if (selectedFilter !== "all") {
      filtered = formattedBookings.filter(
        (reservation) => reservation.status === selectedFilter
      );
    }

    // Ordenar por prioridad de estado, luego por fecha de check-in
    return filtered.sort((a, b) => {
      // PRIORIDAD ABSOLUTA: Las pendientes siempre van primero, sin importar filtro
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (b.status === "pending" && a.status !== "pending") return 1;
      
      // Primero: ordenar por prioridad de estado (solo si ninguna es pendiente)
      const priorityDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
      if (priorityDiff !== 0) return priorityDiff;

      // Segundo: dentro del mismo estado, ordenar por fecha
      const dateA = new Date(a.checkIn).getTime();
      const dateB = new Date(b.checkIn).getTime();
      
      // Para pendientes, upcoming y current: más cercanas primero
      if (a.status === "pending" || a.status === "upcoming" || a.status === "current") {
        return dateA - dateB;
      }
      
      // Para past y cancelled: más recientes primero
      return dateB - dateA;
    });
  }, [bookings, selectedFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando reservas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">
              Error al cargar reservas
            </h3>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={refreshBookings}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
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
          Consulta el estado de tus viajes, encuentra detalles clave y mantén
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
              reservation.status === "upcoming" ||
              reservation.status === "pending";

            return (
              <GuestReservationCard
                key={reservation.id}
                reservation={reservation}
                statusConfig={statusStyles}
                onChatWithHost={(res) =>
                  handleChatClick(res as FormattedReservation)
                }
                onCancelReservation={handleCancelReservation}
                onLeaveReview={handleLeaveReview}
                canStartChat={canStartChat}
              />
            );
          })
        )}
      </section>

      <LeaveReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleSubmitReview}
        reviewRole="guest"
        targetName={reviewModal.targetName}
        targetImage={reviewModal.targetImage}
      />

      <PreCancellationModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirmCancel={handleConfirmCancel}
        totalAmount={cancelModal.totalAmount}
        policyType={cancelModal.policyType}
        checkInDate={cancelModal.checkInDate}
      />
    </div>
  );
}