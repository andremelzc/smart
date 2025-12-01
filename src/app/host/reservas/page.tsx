"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import {
  HostReservationCard,
  ReservationFilters,
  ReservationEmptyState,
  type HostReservation,
  type FilterSegment,
} from "@/src/components/features/reservations";
import GuestRequestModal, {
  type DetailedReservation,
} from "@/src/components/features/host/GuestRequestModal";
import DeclineReasonModal from "@/src/components/features/host/DeclineReasonModal";
import AcceptReasonModal from "@/src/components/features/host/AcceptReasonModal";
// Importamos el Modal de Reseña
import { LeaveReviewModal } from "@/src/components/reviews/LeaveReviewModal";
import { useHostBookings } from "@/src/hooks/useHostBookings";
import { bookingService } from "@/src/services/booking.service";

type HostReservationStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "declined"
  | "cancelled";
type TimeFilter = "present" | "upcoming" | "past" | "all";

const statusConfig: Record<
  HostReservationStatus,
  { label: string; badge: string }
> = {
  pending: {
    label: "Pendiente",
    badge: "bg-yellow-50 text-yellow-800 border border-yellow-200",
  },
  confirmed: {
    label: "Confirmada",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  completed: {
    label: "Completada",
    badge: "bg-green-50 text-green-700 border border-green-200",
  },
  declined: {
    label: "Rechazada",
    badge: "bg-gray-50 text-gray-700 border border-gray-200",
  },
  cancelled: {
    label: "Cancelada",
    badge: "bg-red-50 text-red-700 border border-red-200",
  },
};

const statusSegments: FilterSegment<"all" | HostReservationStatus>[] = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendientes" },
  { key: "confirmed", label: "Confirmadas" },
  { key: "completed", label: "Completadas" },
  { key: "declined", label: "Rechazadas" },
  { key: "cancelled", label: "Canceladas" },
];

const timeSegments: FilterSegment<TimeFilter>[] = [
  { key: "present", label: "Presentes" },
  { key: "upcoming", label: "Próximas" },
  { key: "past", label: "Pasadas" },
  { key: "all", label: "Todas" },
];

const normalizeDate = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const formatDay = (value: string) =>
  new Intl.DateTimeFormat("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "long",
  }).format(new Date(value));

export default function HostReservationsPage() {
  const [statusFilter, setStatusFilter] = useState<
    "all" | HostReservationStatus
  >("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("present");
  const [selectedReservationId, setSelectedReservationId] = useState<
    string | null
  >(null);
  const [selectedReservation, setSelectedReservation] =
    useState<DetailedReservation | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Modales de acción existentes
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [pendingDeclineId, setPendingDeclineId] = useState<string | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [pendingAcceptId, setPendingAcceptId] = useState<string | null>(null);

  // Nuevo Estado para el Modal de Reseña
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    bookingId: number | null;
    guestName: string;
    guestImage?: string;
  }>({
    isOpen: false,
    bookingId: null,
    guestName: "",
    guestImage: undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { bookings, loading, error, refreshBookings } = useHostBookings();

  const today = normalizeDate(new Date());

  // Mapear el estado de la BD al estado de la UI
  const getReservationStatus = (dbStatus: string): HostReservationStatus => {
    const status = dbStatus.toLowerCase();
    switch (status) {
      case "pending":
        return "pending";
      case "accepted":
      case "confirmed":
        return "confirmed";
      case "completed":
        return "completed";
      case "declined":
        return "declined";
      case "cancelled":
        return "cancelled";
      default:
        return "pending";
    }
  };

  // Convertir bookings de BD al formato de la UI
  const formattedReservations = useMemo(() => {
    return bookings.map((booking) => ({
      id: `RES-${booking.bookingId}`,
      propertyName: booking.propertyTitle,
      location: "Lima, Peru", // TODO: agregar ubicación a la BD
      checkIn: booking.checkinDate,
      checkOut: booking.checkoutDate,
      guests: booking.guestCount,
      status: getReservationStatus(booking.status),
      guestName: bookingService.getTenantFullName(booking),
      total: bookingService.formatCurrency(booking.totalAmount),
      roomId: `ROOM-${booking.bookingId.toString().padStart(3, "0")}`,
      requestDescription: "Solicitud de reserva pendiente de revisión.",
      contactEmail: "guest@example.com", // TODO: agregar email a la BD
      contactPhone: "+51 900 000 000", // TODO: agregar teléfono a la BD
    }));
  }, [bookings]);

  const filteredReservations = useMemo(() => {
    return formattedReservations.filter((reservation) => {
      const checkIn = normalizeDate(reservation.checkIn);
      const checkOut = normalizeDate(reservation.checkOut);
      const matchesStatus =
        statusFilter === "all" || reservation.status === statusFilter;

      let matchesTime = true;
      if (timeFilter === "present") {
        matchesTime = checkIn <= today && checkOut >= today;
      } else if (timeFilter === "upcoming") {
        // Para próximas: solo futuras Y que no estén canceladas/rechazadas
        matchesTime = checkIn > today && 
          !['cancelled', 'declined'].includes(reservation.status.toLowerCase());
      } else if (timeFilter === "past") {
        matchesTime = checkOut < today;
      }

      return matchesStatus && matchesTime;
    });
  }, [formattedReservations, statusFilter, timeFilter, today]);

  const sampleUpcomingReservation = filteredReservations.find(
    (reservation) => normalizeDate(reservation.checkIn) > today
  );

  const upcomingExampleText = sampleUpcomingReservation
    ? `Ejemplo: usa el filtro "Proximas" para ver reservas como "${sampleUpcomingReservation.propertyName}" con check-in el ${formatDay(
        sampleUpcomingReservation.checkIn
      )}.`
    : 'Ejemplo: usa el filtro "Proximas" para mostrar reservas con check-in posterior a hoy.';

  // Convert to HostReservation format for the component
  const hostReservations = useMemo((): HostReservation[] => {
    return filteredReservations.map((reservation) => ({
      id: reservation.id,
      propertyName: reservation.propertyName,
      location: reservation.location,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      guests: reservation.guests,
      status: reservation.status,
      guestName: reservation.guestName,
      total: reservation.total,
      roomId: reservation.roomId,
      requestDescription: reservation.requestDescription,
      contactEmail: reservation.contactEmail,
      contactPhone: reservation.contactPhone,
    }));
  }, [filteredReservations]);

  // Función para cargar detalles de reserva cuando se selecciona una
  const loadReservationDetails = useCallback(
    async (reservationId: string) => {
      try {
        setLoadingDetail(true);

        // Extraer booking ID del formato "RES-123"
        const bookingId = parseInt(reservationId.replace("RES-", ""));

        // Obtener detalles completos de la reserva
        const detailedInfo =
          await bookingService.getDetailedBookingInfo(bookingId);

        // Mapear a formato del modal
        const detailedReservation =
          bookingService.mapToDetailedReservation(detailedInfo);

        setSelectedReservation(detailedReservation);
      } catch (error) {
        console.error("Error al cargar detalles de reserva:", error);
        // En caso de error, usar datos básicos disponibles
        const reservation = formattedReservations.find(
          (item) => item.id === reservationId
        );
        if (reservation) {
          const originalBooking = bookings.find(
            (booking) => `RES-${booking.bookingId}` === reservation.id
          );

          setSelectedReservation({
            id: reservation.id,
            guestName: reservation.guestName,
            propertyName: reservation.propertyName,
            checkIn: reservation.checkIn,
            checkOut: reservation.checkOut,
            guestCount: reservation.guests,
            status: reservation.status as DetailedReservation["status"],
            roomId: reservation.roomId,
            totalAmount: originalBooking?.totalAmount || 0,
            createdAt: reservation.checkIn,
            // Campos básicos por defecto
            basePrice: undefined,
            serviceFee: undefined,
            contactEmail: undefined,
            contactPhone: undefined,
            propertyAddress: undefined,
            hostNote: undefined,
            checkinCode: undefined,
            completedAt: undefined,
            guestMessage: undefined,
            paymentStatus: undefined,
            paymentMessage: undefined,
            hasHostReview: false,
            hasGuestReview: false,
          });
        }
      } finally {
        setLoadingDetail(false);
      }
    },
    [bookings, formattedReservations]
  );

  // Effect para cargar detalles cuando se selecciona una reserva
  useEffect(() => {
    if (selectedReservationId) {
      loadReservationDetails(selectedReservationId);
    } else {
      setSelectedReservation(null);
    }
  }, [loadReservationDetails, selectedReservationId]);

  // --- HANDLERS DE ACCIÓN ---

  const handleAcceptReservation = (requestId: string) => {
    setPendingAcceptId(requestId);
    setShowAcceptModal(true);
  };

  const handleConfirmAccept = async (note: string) => {
    if (!pendingAcceptId) return;

    const bookingId = parseInt(pendingAcceptId.replace("RES-", ""), 10);

    if (isNaN(bookingId)) {
      console.error("ID de reserva inválido:", pendingAcceptId);
      return;
    }

    setIsSubmitting(true);

    try {
      await bookingService.acceptBooking(bookingId, note || undefined);
      setShowAcceptModal(false);
      setSelectedReservationId(null);
      setPendingAcceptId(null);
      await refreshBookings();
      console.log("✅ Reserva aceptada exitosamente");
    } catch (error) {
      console.error("❌ Error al aceptar reserva:", error);
      alert(
        error instanceof Error ? error.message : "Error al aceptar la reserva"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeclineReservation = (requestId: string) => {
    setPendingDeclineId(requestId);
    setShowDeclineModal(true);
  };

  const handleConfirmDecline = async (reason: string) => {
    if (!pendingDeclineId) return;

    const bookingId = parseInt(pendingDeclineId.replace("RES-", ""), 10);

    if (isNaN(bookingId)) {
      console.error("ID de reserva inválido:", pendingDeclineId);
      return;
    }

    setIsSubmitting(true);

    try {
      await bookingService.declineBooking(bookingId, reason || undefined);
      setShowDeclineModal(false);
      setSelectedReservationId(null);
      setPendingDeclineId(null);
      await refreshBookings();
      console.log("✅ Reserva rechazada exitosamente");
    } catch (error) {
      console.error("❌ Error al rechazar reserva:", error);
      alert(
        error instanceof Error ? error.message : "Error al rechazar la reserva"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelReservation = (requestId: string) => {
    if (confirm("¿Estás seguro de que quieres cancelar esta reserva?")) {
      console.log("Cancelar reserva:", requestId);
      setSelectedReservationId(null);
    }
  };

  const handleSendMessage = (requestId: string) => {
    console.log("Enviar mensaje:", requestId);
    // TODO: Redirigir a la página de mensajes
    setSelectedReservationId(null);
  };

  // ✅ LOGICA DE RESEÑAS CONECTADA
  const handleWriteReview = (requestId: string) => {
    const numericId = parseInt(requestId.replace("RES-", ""), 10);

    // Intentamos buscar la reserva completa para obtener la foto del huésped
    // Si tenemos selectedReservation (el modal de detalles abierto), usamos eso.
    const guestImage =
      selectedReservation?.profileImageUrl ||
      bookings.find((b) => b.bookingId === numericId)?.imageUrl;

    const guestName =
      selectedReservation?.guestName ||
      formattedReservations.find((r) => r.id === requestId)?.guestName ||
      "Huésped";

    setReviewModal({
      isOpen: true,
      bookingId: numericId,
      guestName: guestName,
      guestImage: guestImage || undefined,
    });

    // Cerramos el modal de detalles para enfocar la reseña
    setSelectedReservationId(null);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!reviewModal.bookingId) return;

    console.log("👑 Host enviando reseña:", {
      bookingId: reviewModal.bookingId,
      rating,
      comment,
    });

    // AQUÍ: Llamada al servicio real
    // await reviewService.createHostReview(...)

    setReviewModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleViewReviews = (requestId: string) => {
    console.log("Ver reseñas:", requestId);
    setSelectedReservationId(null);
  };

  const handleViewMessages = (requestId: string) => {
    console.log("Ver mensajes:", requestId);
    setSelectedReservationId(null);
  };

  const handleModifyReservation = (requestId: string) => {
    console.log("Modificar reserva:", requestId);
    setSelectedReservationId(null);
  };

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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            Reservas de mis espacios
          </h1>
          <p className="max-w-3xl text-gray-600">
            Revisa el estado de tus reservas actuales, identifica las próximas
            llegadas y navega rápidamente al detalle para aceptar o rechazar
            solicitudes pendientes.
          </p>
        </header>

        <ReservationFilters
          title="Configura la vista"
          statusSegments={statusSegments}
          selectedStatus={statusFilter}
          onStatusChange={setStatusFilter}
          timeSegments={timeSegments}
          selectedTime={timeFilter}
          onTimeChange={(time) => setTimeFilter(time as TimeFilter)}
          helpText={upcomingExampleText}
        />

        <section className="space-y-4">
          {hostReservations.length === 0 ? (
            <ReservationEmptyState
              variant="host"
              filterType={
                statusFilter === "all" && timeFilter === "all"
                  ? "all"
                  : "filtered"
              }
            />
          ) : (
            hostReservations.map((reservation) => {
              const isSelected = selectedReservationId === reservation.id;

              return (
                <HostReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  statusConfig={statusConfig}
                  onViewDetails={() =>
                    setSelectedReservationId(isSelected ? null : reservation.id)
                  }
                  isSelected={isSelected}
                />
              );
            })
          )}
        </section>
      </div>

      <GuestRequestModal
        open={Boolean(selectedReservationId)}
        request={loadingDetail ? null : selectedReservation}
        onClose={() => setSelectedReservationId(null)}
        onAccept={handleAcceptReservation}
        onDecline={handleDeclineReservation}
        onCancel={handleCancelReservation}
        onSendMessage={handleSendMessage}
        onWriteReview={handleWriteReview}
        onViewReviews={handleViewReviews}
        onViewMessages={handleViewMessages}
        onModifyReservation={handleModifyReservation}
      />

      {/* Modal de Confirmación de Rechazo */}
      <DeclineReasonModal
        open={showDeclineModal}
        onClose={() => {
          setShowDeclineModal(false);
          setPendingDeclineId(null);
        }}
        onConfirm={handleConfirmDecline}
        guestName={selectedReservation?.guestName}
        isLoading={isSubmitting}
      />

      {/* Modal de Confirmación de Aceptación */}
      <AcceptReasonModal
        open={showAcceptModal}
        onClose={() => {
          setShowAcceptModal(false);
          setPendingAcceptId(null);
        }}
        onConfirm={handleConfirmAccept}
        guestName={selectedReservation?.guestName}
        propertyName={selectedReservation?.propertyName}
        checkIn={selectedReservation?.checkIn}
        checkOut={selectedReservation?.checkOut}
        totalAmount={selectedReservation?.totalAmount}
        isLoading={isSubmitting}
      />

      {/* ✅ Modal de Reseña (Host) */}
      <LeaveReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleSubmitReview}
        reviewRole="host" // 👈 Activa el modo anfitrión (morado)
        targetName={reviewModal.guestName}
        targetImage={reviewModal.guestImage}
      />

      {/* Modal de carga para detalles */}
      {loadingDetail && selectedReservationId && (
        <div className="bg-gray-dark-500/60 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Cargando detalles
            </h3>
            <p className="text-gray-600">
              Obteniendo información completa de la reserva...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
