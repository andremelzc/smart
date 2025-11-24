"use client";

import React, { useState } from "react";
import { useTenantBookings } from "@/src/hooks/useTenantBookings";
import {
  bookingService,
  type TenantBooking,
} from "@/src/services/booking.service";
// 1. Importamos tus modales (Reseña y Cancelación)
import { LeaveReviewModal } from "../reviews/LeaveReviewModal";
import { PreCancellationModal } from "@/src/components/features/reservations/PreCancellationModal";
import { Button } from "@/src/components/ui/Button";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  User,
  MessageSquare,
  Loader2,
  AlertCircle,
  MessageSquarePlus,
  Ban, // Icono para cancelar
} from "lucide-react";

// Estado para el modal de reseña
interface ReviewModalState {
  isOpen: boolean;
  bookingId: number | null;
  targetName: string;
  targetImage?: string;
}

// 2. NUEVO: Estado para el modal de cancelación
interface CancelModalState {
  isOpen: boolean;
  bookingId: number | null;
  totalAmount: number;
  checkInDate: string;
  policyType: "flexible" | "moderate" | "strict";
}

export function TenantBookingsList() {
  const { bookings, loading, error, refreshBookings } = useTenantBookings();

  // Estado Modal Reseña
  const [reviewModal, setReviewModal] = useState<ReviewModalState>({
    isOpen: false,
    bookingId: null,
    targetName: "",
    targetImage: undefined,
  });

  // 3. NUEVO: Estado Modal Cancelación
  const [cancelModal, setCancelModal] = useState<CancelModalState>({
    isOpen: false,
    bookingId: null,
    totalAmount: 0,
    checkInDate: "",
    policyType: "flexible", // Por defecto flexible, idealmente vendría de la BD
  });

  // --- HANDLERS RESEÑA ---
  const handleOpenReview = (booking: TenantBooking) => {
    setReviewModal({
      isOpen: true,
      bookingId: booking.bookingId,
      targetName: booking.title,
      targetImage: booking.imageUrl || undefined,
    });
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!reviewModal.bookingId) return;
    console.log("📝 Enviando reseña:", {
      bookingId: reviewModal.bookingId,
      rating,
      comment,
    });
    // await reviewService.create({ ... });
    setReviewModal((prev) => ({ ...prev, isOpen: false }));
  };

  // --- 4. NUEVO: HANDLERS CANCELACIÓN ---

  const handleClickCancel = (booking: TenantBooking) => {
    // Abrimos el modal PRE-cancelación con los datos financieros
    setCancelModal({
      isOpen: true,
      bookingId: booking.bookingId,
      totalAmount: booking.totalAmount,
      checkInDate: booking.checkinDate.toString(), // Aseguramos formato string
      policyType: "flexible", // AQUÍ: Si tu backend trae 'policy', úsalo: booking.policy || 'flexible'
    });
  };

  const handleConfirmCancel = async () => {
    if (!cancelModal.bookingId) return;

    try {
      console.log("🚫 Confirmando cancelación para:", cancelModal.bookingId);
      
      // Llamada real al servicio de cancelación
      await bookingService.cancelBookingAsTenant(cancelModal.bookingId);
      
      // Cerrar modal y refrescar lista
      setCancelModal(prev => ({ ...prev, isOpen: false }));
      refreshBookings(); // Recarga la lista para ver el estado 'CANCELLED'

      // Simulación de éxito
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Cerrar modal y refrescar lista
      setCancelModal((prev) => ({ ...prev, isOpen: false }));
      refreshBookings(); // Recarga la lista para ver el estado 'CANCELLED'
    } catch (error) {
      console.error("Error cancelando:", error);
      alert("No se pudo cancelar la reserva. Inténtalo más tarde.");
    }
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
            <h3 className="font-semibold text-red-900">Error al cargar</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-8 text-center">
        <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          No tienes reservas
        </h3>
        <p className="text-gray-600">
          Cuando hagas una reserva, aparecerá aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mis Reservas</h2>
        <span className="text-sm text-gray-600">
          {bookings.length} reservas
        </span>
      </div>

      <div className="grid gap-6">
        {bookings.map((booking) => {
          const status = booking.status.toUpperCase(); // Normalizar
          const isCompleted = status === "ACCEPTED" || status === "COMPLETED";
          // Solo se puede cancelar si está confirmada o pendiente, y es futura
          const canCancel = (status === "CONFIRMED" || status === "PENDING" || status === "ACCEPTED" || status === "APPROVED");
          const canReview = isCompleted; 
          
          // Debug para ver estados
          console.log(`Booking ${booking.bookingId}: status=${booking.status}, canCancel=${canCancel}`); 

          return (
            <div
              key={booking.bookingId}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-gray-900">
                    {booking.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="mr-1 h-4 w-4" />
                    {bookingService.getFullAddress(booking)}
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${bookingService.getStatusColor(booking.status)}`}
                >
                  {bookingService.translateStatus(booking.status)}
                </span>
              </div>

              {/* Grid de detalles (Fechas, Huespedes, Precio) */}
              <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">Check-in</p>
                    <p>{bookingService.formatDate(booking.checkinDate)}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">Check-out</p>
                    <p>{bookingService.formatDate(booking.checkoutDate)}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="mr-2 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">Huéspedes</p>
                    <p>{booking.guestCount} pers.</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="mr-2 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">Total</p>
                    <p className="font-semibold text-green-600">
                      {bookingService.formatCurrency(booking.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer de la tarjeta con acciones */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="mr-2 h-4 w-4 text-gray-400" />
                  <span>
                    Anfitrión: {bookingService.getHostFullName(booking)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  
                  {/* DEBUG: Mostrar estado actual */}
                  <span className="text-xs text-gray-400">
                    Status: {booking.status} | Can cancel: {canCancel ? 'YES' : 'NO'}
                  </span>
                  
                  {/* BOTÓN 1: CANCELAR (Solo si está activa) */}
                  {canCancel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClickCancel(booking)} // 👈 Dispara el modal
                      className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 hover:border-red-300"
                    >
                      <Ban className="h-4 w-4" />
                      Cancelar reserva
                    </Button>
                  )}

                  {/* BOTÓN 2: RESEÑA (Solo si completada) */}
                  {canReview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenReview(booking)}
                      className="gap-2 border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50"
                    >
                      <MessageSquarePlus className="h-4 w-4" />
                      Escribir reseña
                    </Button>
                  )}
                </div>
              </div>

              {booking.hostNote && (
                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="mt-0.5 h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Nota del anfitrión:
                      </p>
                      <p className="text-sm text-blue-800">
                        {booking.hostNote}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. Renderizado de Modales al final del DOM */}

      <LeaveReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleSubmitReview}
        reviewRole="guest"
        targetName={reviewModal.targetName}
        targetImage={reviewModal.targetImage}
      />

      {/* MODAL DE PRE-CANCELACIÓN */}
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
