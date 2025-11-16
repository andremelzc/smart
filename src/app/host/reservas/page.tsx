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
import GuestRequestModal, { type DetailedReservation } from "@/src/components/features/host/GuestRequestModal";
import DeclineReasonModal from "@/src/components/features/host/DeclineReasonModal";
import AcceptReasonModal from "@/src/components/features/host/AcceptReasonModal";
import { useHostBookings } from "@/src/hooks/useHostBookings";
import { bookingService } from "@/src/services/booking.service";

type HostReservationStatus = "pending" | "confirmed" | "completed" | "declined" | "cancelled";
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
  { key: "upcoming", label: "Proximas" },
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
  const [statusFilter, setStatusFilter] =
    useState<"all" | HostReservationStatus>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("present");
  const [selectedReservationId, setSelectedReservationId] = useState<
    string | null
  >(null);
  const [selectedReservation, setSelectedReservation] = useState<DetailedReservation | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [pendingDeclineId, setPendingDeclineId] = useState<string | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [pendingAcceptId, setPendingAcceptId] = useState<string | null>(null);
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
      roomId: `ROOM-${booking.bookingId.toString().padStart(3, '0')}`,
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
        matchesTime = checkIn > today;
      } else if (timeFilter === "past") {
        matchesTime = checkOut < today;
      }

      return matchesStatus && matchesTime;
    });
  }, [formattedReservations, statusFilter, timeFilter, today]);

  const sampleUpcomingReservation = filteredReservations.find(
    (reservation) => normalizeDate(reservation.checkIn) > today,
  );

  const upcomingExampleText = sampleUpcomingReservation
    ? `Ejemplo: usa el filtro "Proximas" para ver reservas como "${sampleUpcomingReservation.propertyName}" con check-in el ${formatDay(
        sampleUpcomingReservation.checkIn,
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
  const loadReservationDetails = useCallback(async (reservationId: string) => {
    try {
      setLoadingDetail(true);
      
      // Extraer booking ID del formato "RES-123"
      const bookingId = parseInt(reservationId.replace('RES-', ''));
      
      // Obtener detalles completos de la reserva
      const detailedInfo = await bookingService.getDetailedBookingInfo(bookingId);
      
      // Mapear a formato del modal
      const detailedReservation = bookingService.mapToDetailedReservation(detailedInfo);
      
      setSelectedReservation(detailedReservation);
    } catch (error) {
      console.error('Error al cargar detalles de reserva:', error);
      // En caso de error, usar datos básicos disponibles
      const reservation = formattedReservations.find(
        (item) => item.id === reservationId,
      );
      if (reservation) {
        const originalBooking = bookings.find(
          booking => `RES-${booking.bookingId}` === reservation.id
        );
        
        setSelectedReservation({
          id: reservation.id,
          guestName: reservation.guestName,
          propertyName: reservation.propertyName,
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          guestCount: reservation.guests,
          status: reservation.status as DetailedReservation['status'],
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
  }, [bookings, formattedReservations]);

  // Effect para cargar detalles cuando se selecciona una reserva
  useEffect(() => {
    if (selectedReservationId) {
      loadReservationDetails(selectedReservationId);
    } else {
      setSelectedReservation(null);
    }
  }, [loadReservationDetails, selectedReservationId]);

  // Funciones de callback para las acciones del modal
  const handleAcceptReservation = (requestId: string) => {
    setPendingAcceptId(requestId);
    setShowAcceptModal(true);
  };

  const handleConfirmAccept = async (note: string) => {
    if (!pendingAcceptId) return;

    // Extraer el bookingId numérico del requestId (formato: RES-123)
    const bookingId = parseInt(pendingAcceptId.replace('RES-', ''), 10);
    
    if (isNaN(bookingId)) {
      console.error('ID de reserva inválido:', pendingAcceptId);
      return;
    }

    setIsSubmitting(true);

    try {
      await bookingService.acceptBooking(bookingId, note || undefined);
      
      // Cerrar modales y limpiar estado
      setShowAcceptModal(false);
      setSelectedReservationId(null);
      setPendingAcceptId(null);
      
      // Refrescar la lista de reservas
      await refreshBookings();
      
      console.log('✅ Reserva aceptada exitosamente');
    } catch (error) {
      console.error('❌ Error al aceptar reserva:', error);
      alert(error instanceof Error ? error.message : 'Error al aceptar la reserva');
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

    // Extraer el bookingId numérico del requestId (formato: RES-123)
    const bookingId = parseInt(pendingDeclineId.replace('RES-', ''), 10);
    
    if (isNaN(bookingId)) {
      console.error('ID de reserva inválido:', pendingDeclineId);
      return;
    }

    setIsSubmitting(true);

    try {
      await bookingService.declineBooking(bookingId, reason || undefined);
      
      // Cerrar modales y limpiar estado
      setShowDeclineModal(false);
      setSelectedReservationId(null);
      setPendingDeclineId(null);
      
      // Refrescar la lista de reservas
      await refreshBookings();
      
      console.log('✅ Reserva rechazada exitosamente');
    } catch (error) {
      console.error('❌ Error al rechazar reserva:', error);
      alert(error instanceof Error ? error.message : 'Error al rechazar la reserva');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelReservation = (requestId: string) => {
    if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      console.log('Cancelar reserva:', requestId);
      // TODO: Implementar lógica de cancelar reserva
      setSelectedReservationId(null);
    }
  };

  const handleSendMessage = (requestId: string) => {
    console.log('Enviar mensaje:', requestId);
    // TODO: Redirigir a la página de mensajes
    setSelectedReservationId(null);
  };

  const handleWriteReview = (requestId: string) => {
    console.log('Escribir reseña:', requestId);
    // TODO: Abrir modal de reseña
    setSelectedReservationId(null);
  };

  const handleViewReviews = (requestId: string) => {
    console.log('Ver reseñas:', requestId);
    // TODO: Mostrar modal de reseñas
    setSelectedReservationId(null);
  };

  const handleViewMessages = (requestId: string) => {
    console.log('Ver mensajes:', requestId);
    // TODO: Redirigir a historial de mensajes
    setSelectedReservationId(null);
  };

  const handleModifyReservation = (requestId: string) => {
    console.log('Modificar reserva:', requestId);
    // TODO: Abrir modal de modificación
    setSelectedReservationId(null);
  };

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            Reservas de mis espacios
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Revisa el estado de tus reservas actuales, identifica las proximas
            llegadas y navega rapidamente al detalle para aceptar o rechazar
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
              filterType={statusFilter === "all" && timeFilter === "all" ? "all" : "filtered"} 
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

      {/* Modal de carga para detalles */}
      {loadingDetail && selectedReservationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-dark-500/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
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
