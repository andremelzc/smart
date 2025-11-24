"use client";

import Image from "next/image";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ChevronRight,
  Hotel,
  CheckCircle,
  XCircle,
  MessageCircle,
  Ban,
  MessageSquarePlus,
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";

// Base reservation type that both variants can extend
export interface BaseReservation {
  id: string;
  propertyName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
  dbStatus?: string; // Estado original de la BD para lógica de cancelación
  totalAmount?: number; // Para cálculo de reembolso
}

// Host-specific reservation (from host perspective)
export interface HostReservation extends BaseReservation {
  guestName: string;
  total: string;
  roomId: string;
  requestDescription: string;
  contactEmail: string;
  contactPhone: string;
}

// Guest-specific reservation (from guest/account perspective)
export interface GuestReservation extends BaseReservation {
  hostName: string;
  price: string;
  notes: string;
  imageUrl?: string;
}

// Status configuration type
export interface StatusConfig {
  label: string;
  badge: string;
  dot?: string;
}

// Card variant props
interface BaseReservationCardProps<T extends BaseReservation> {
  reservation: T;
  statusConfig: Record<string, StatusConfig>;
  variant: "host" | "guest";
  onAction?: (reservation: T) => void;
  actionLabel?: string;
  actionIcon?: React.ComponentType<{ className?: string }>;
  isSelected?: boolean;
  // 🆕 Nuevas props para cancelación
  onCancel?: (reservation: T) => void;
  onReview?: (reservation: T) => void;
}

// Format date range helper
const formatRange = (checkIn: string, checkOut: string) => {
  const formatter = new Intl.DateTimeFormat("es-PE", {
    month: "short",
    day: "numeric",
  });
  return `${formatter.format(new Date(checkIn))} - ${formatter.format(new Date(checkOut))}`;
};

// Format single date helper
const formatDay = (dateString: string) => {
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
  }).format(new Date(dateString));
};

// 🆕 Helper: Determinar si se puede cancelar según estado
const canCancelReservation = (status: string, dbStatus?: string): boolean => {
  // Usar dbStatus si está disponible, sino usar status
  const statusToCheck = dbStatus || status;
  const normalizedStatus = statusToCheck.trim().toUpperCase();
  const cancellableStatuses = ["PENDING", "CONFIRMED", "ACCEPTED", "APPROVED"];
  return cancellableStatuses.includes(normalizedStatus);
};

// 🆕 Helper: Determinar si se puede reseñar según estado
const canReviewReservation = (status: string, dbStatus?: string): boolean => {
  // Usar dbStatus si está disponible, sino usar status
  const statusToCheck = dbStatus || status;
  const normalizedStatus = statusToCheck.trim().toUpperCase();
  const reviewableStatuses = ["COMPLETED"]; // Solo reservas completamente terminadas
  return normalizedStatus === "COMPLETED" || (normalizedStatus === "ACCEPTED" && status === "past");
};

// 🆕 Helper: Verificar si la reserva es pasada (para no cancelar reservas pasadas)
const isPastReservation = (checkOutDate: string): boolean => {
  return new Date(checkOutDate) < new Date();
};

export function ReservationCard<T extends BaseReservation>({
  reservation,
  statusConfig,
  variant,
  onAction,
  actionLabel,
  actionIcon: ActionIcon = ChevronRight,
  isSelected = false,
  onCancel,
  onReview,
}: BaseReservationCardProps<T>) {
  const statusInfo = statusConfig[reservation.status];
  const isHostVariant = variant === "host";
  const isGuestVariant = variant === "guest";

  // Type guards to access variant-specific properties safely
  const hostReservation = isHostVariant
    ? (reservation as unknown as HostReservation)
    : null;
  const guestReservation = isGuestVariant
    ? (reservation as unknown as GuestReservation)
    : null;

  // 🆕 Determinar qué botones mostrar según estado
  const showCancelButton = 
    isGuestVariant && 
    onCancel && 
    canCancelReservation(reservation.status, reservation.dbStatus) &&
    !isPastReservation(reservation.checkOut);

  const showReviewButton = 
    isGuestVariant && 
    onReview && 
    canReviewReservation(reservation.status, reservation.dbStatus);

  // Debug temporal
  if (isGuestVariant) {
    console.log(`ReservationCard Debug - ID: ${reservation.id}`);
    console.log(`- status: ${reservation.status}, dbStatus: ${reservation.dbStatus}`);
    console.log(`- isGuestVariant: ${isGuestVariant}, onCancel: ${!!onCancel}`);
    console.log(`- canCancelReservation: ${canCancelReservation(reservation.status, reservation.dbStatus)}`);
    console.log(`- isPastReservation: ${isPastReservation(reservation.checkOut)}`);
    console.log(`- showCancelButton: ${showCancelButton}`);
    console.log(`- showReviewButton: ${showReviewButton}`);
  }

  return (
    <article className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-1 items-start gap-4">
          {/* Image for guest variant */}
          {isGuestVariant && (
            <div className="hidden h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl lg:block">
              {guestReservation?.imageUrl ? (
                <Image
                  src={guestReservation.imageUrl}
                  alt={reservation.propertyName}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="bg-blue-light-50 text-blue-light-500 flex h-full w-full items-center justify-center">
                  <Hotel className="h-10 w-10" />
                </div>
              )}
            </div>
          )}

          <div className="flex-1 space-y-3">
            {/* Header with title and status */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {reservation.propertyName}
                </h2>
                {isHostVariant && hostReservation?.roomId && (
                  <p className="text-sm text-gray-500">
                    {hostReservation.roomId}
                  </p>
                )}
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="text-blue-light-500 h-4 w-4" />
                  {reservation.location}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.badge}`}
              >
                {statusInfo.dot && (
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${statusInfo.dot}`}
                  />
                )}
                {statusInfo.label}
              </span>
            </div>

            {/* Basic info row */}
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
                {isHostVariant
                  ? `Entrada ${formatDay(reservation.checkIn)}`
                  : `Check-in: ${new Date(
                      reservation.checkIn
                    ).toLocaleTimeString("es-PE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} / Check-out: ${new Date(
                      reservation.checkOut
                    ).toLocaleTimeString("es-PE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
              </span>
            </div>

            {/* Variant-specific details */}
            {isGuestVariant && guestReservation && (
              <div className="grid gap-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>
                    Anfitrión:{" "}
                    <span className="font-medium text-gray-900">
                      {guestReservation.hostName}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="text-blue-light-500 h-4 w-4" />
                  <span>
                    Código de reserva:{" "}
                    <span className="font-medium text-gray-900">
                      {reservation.id}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="text-blue-light-500 h-4 w-4" />
                  <span>
                    Total pagado:{" "}
                    <span className="font-semibold text-gray-900">
                      {guestReservation.price}
                    </span>
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="text-blue-light-500 mt-0.5 h-4 w-4" />
                  <span>{guestReservation.notes}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action section */}
        {isHostVariant && hostReservation && (
          <div className="flex flex-col items-start gap-2 text-right">
            <span className="text-sm text-gray-500">Total</span>
            <p className="text-xl font-semibold text-gray-900">
              {hostReservation.total}
            </p>
            {onAction && (
              <Button
                variant="ghost"
                onClick={() => onAction(reservation)}
                className="text-blue-light-600 hover:text-blue-light-700 mt-2"
              >
                {actionLabel || (isSelected ? "Cerrar" : "Ver detalle")}
                <ActionIcon className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 🆕 Action buttons for guest variant - CON CANCELAR Y RESEÑA */}
      {isGuestVariant && (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
          {/* Botón de Chat (original) */}
          {onAction && (
            <Button variant="ghost" onClick={() => onAction(reservation)}>
              <ActionIcon className="mr-2 h-4 w-4" />
              {actionLabel || "Acción"}
            </Button>
          )}

          {/* 🆕 Botón CANCELAR (solo si está en estado cancelable) */}
          {showCancelButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel!(reservation)}
              className="gap-2 border border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
            >
              <Ban className="h-4 w-4" />
              Cancelar reserva
            </Button>
          )}

          {/* 🆕 Botón RESEÑA (solo si está completada) */}
          {showReviewButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReview!(reservation)}
              className="gap-2 border border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Escribir reseña
            </Button>
          )}
        </div>
      )}
    </article>
  );
}

// Convenience components for each variant
export function HostReservationCard({
  reservation,
  statusConfig,
  onViewDetails,
  isSelected,
}: {
  reservation: HostReservation;
  statusConfig: Record<string, StatusConfig>;
  onViewDetails?: (reservation: HostReservation) => void;
  isSelected?: boolean;
}) {
  return (
    <ReservationCard
      reservation={reservation}
      statusConfig={statusConfig}
      variant="host"
      onAction={onViewDetails}
      isSelected={isSelected}
    />
  );
}

export function GuestReservationCard({
  reservation,
  statusConfig,
  onChatWithHost,
  onCancelReservation, // 🆕
  onLeaveReview, // 🆕
  canStartChat,
}: {
  reservation: GuestReservation;
  statusConfig: Record<string, StatusConfig>;
  onChatWithHost?: (reservation: GuestReservation) => void;
  onCancelReservation?: (reservation: GuestReservation) => void; // 🆕
  onLeaveReview?: (reservation: GuestReservation) => void; // 🆕
  canStartChat?: boolean;
}) {
  return (
    <ReservationCard
      reservation={reservation}
      statusConfig={statusConfig}
      variant="guest"
      onAction={canStartChat ? onChatWithHost : undefined}
      actionLabel={canStartChat ? "Chat con anfitrión" : undefined}
      actionIcon={canStartChat ? MessageCircle : undefined}
      onCancel={onCancelReservation} // 🆕
      onReview={onLeaveReview} // 🆕
    />
  );
}