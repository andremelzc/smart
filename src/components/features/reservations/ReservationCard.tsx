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

// Base reservation type
export interface BaseReservation {
  id: string;
  propertyName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
  dbStatus?: string; // Estado original de la BD para lógica
  totalAmount?: number; // Para cálculo de reembolso (sin policy)
  hasReview?: boolean; // 🆕 Para ocultar el botón si ya reseñó
}

// Host-specific reservation
export interface HostReservation extends BaseReservation {
  guestName: string;
  total: string;
  roomId: string;
  requestDescription: string;
  contactEmail: string;
  contactPhone: string;
}

// Guest-specific reservation
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
  // Acciones adicionales
  onCancel?: (reservation: T) => void;
  onReview?: (reservation: T) => void;
}

// Helpers de formato
const formatRange = (checkIn: string, checkOut: string) => {
  const formatter = new Intl.DateTimeFormat("es-PE", {
    month: "short",
    day: "numeric",
  });
  return `${formatter.format(new Date(checkIn))} - ${formatter.format(
    new Date(checkOut)
  )}`;
};

const formatDay = (dateString: string) => {
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
  }).format(new Date(dateString));
};

// Helper: ¿Se puede cancelar?
const canCancelReservation = (status: string, dbStatus?: string): boolean => {
  const statusToCheck = dbStatus || status;
  const normalizedStatus = statusToCheck.trim().toUpperCase();
  // Estados que permiten cancelación
  const cancellableStatuses = ["PENDING", "CONFIRMED", "ACCEPTED", "APPROVED"];
  return cancellableStatuses.includes(normalizedStatus);
};

// Helper: ¿Se puede reseñar? (Solo si está COMPLETED y no tiene reseña previa)
const canReviewReservation = (
  status: string,
  hasReview?: boolean,
  dbStatus?: string
): boolean => {
  if (hasReview) return false; // Ya tiene reseña, ocultar botón

  const statusToCheck = dbStatus || status;
  const normalizedStatus = statusToCheck.trim().toUpperCase();
  
  // Lógica: Debe estar completada
  return (
    normalizedStatus === "COMPLETED" ||
    (normalizedStatus === "ACCEPTED" && new Date() > new Date()) // Fallback por fechas
  );
};

// Helper: Evitar cancelar reservas pasadas
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
  const statusInfo = statusConfig[reservation.status] || {
    label: reservation.status,
    badge: "bg-gray-100 text-gray-600",
  };
  const isHostVariant = variant === "host";
  const isGuestVariant = variant === "guest";

  const hostReservation = isHostVariant
    ? (reservation as unknown as HostReservation)
    : null;
  const guestReservation = isGuestVariant
    ? (reservation as unknown as GuestReservation)
    : null;

  // Lógica de botones
  const showCancelButton =
    isGuestVariant &&
    onCancel &&
    canCancelReservation(reservation.status, reservation.dbStatus) &&
    !isPastReservation(reservation.checkOut);

  const showReviewButton =
    onReview && // Aplica para ambos (Host y Guest)
    canReviewReservation(
      reservation.status,
      reservation.hasReview,
      reservation.dbStatus
    );

  return (
    <article className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-1 items-start gap-4">
          {/* Imagen (Solo Guest) */}
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
            {/* Header: Título y Badge */}
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

            {/* Info Básica */}
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
                  : `Check-in: 3:00 PM`}
              </span>
            </div>

            {/* Detalles Extra (Solo Guest) */}
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
                    Código:{" "}
                    <span className="font-medium text-gray-900">
                      {reservation.id}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección Host (Derecha) */}
        {isHostVariant && hostReservation && (
          <div className="flex flex-col items-end gap-2 text-right">
            <span className="text-sm text-gray-500">Total</span>
            <p className="text-xl font-semibold text-gray-900">
              {hostReservation.total}
            </p>
            
            <div className="flex gap-2 mt-2 w-full sm:w-auto">
              {/* Botón Reseñar Huésped (Mismo tamaño) */}
              {showReviewButton && onReview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReview(reservation)}
                  className="flex-1 justify-center gap-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 min-w-[140px]"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  Calificar
                </Button>
              )}
              
              {/* Botón Ver Detalle (Mismo tamaño) */}
              {onAction && (
                <Button
                  variant="ghost"
                  onClick={() => onAction(reservation)}
                  className="flex-1 justify-center text-blue-light-600 hover:text-blue-light-700 min-w-[140px]"
                >
                  {actionLabel || (isSelected ? "Cerrar" : "Ver detalle")}
                  <ActionIcon className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Botones de Acción (Guest) - Uniformes */}
      {isGuestVariant && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:flex md:justify-end gap-3">
          {/* Botón Chat */}
          {onAction && (
            <Button 
              variant="ghost"
              onClick={() => onAction(reservation)}
              className="flex-1 md:flex-none justify-center min-w-[160px]"
            >
              <ActionIcon className="mr-2 h-4 w-4" />
              {actionLabel || "Chat"}
            </Button>
          )}

          {/* Botón Cancelar */}
          {showCancelButton && (
            <Button
              variant="ghost"
              onClick={() => onCancel!(reservation)}
              className="flex-1 md:flex-none justify-center gap-2 border border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 min-w-[160px]"
            >
              <Ban className="h-4 w-4" />
              Cancelar reserva
            </Button>
          )}

          {/* Botón Reseña */}
          {showReviewButton && (
            <Button
              variant="ghost"
              onClick={() => onReview!(reservation)}
              className="flex-1 md:flex-none justify-center gap-2 border border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50 min-w-[160px]"
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

// Wrapper Host
export function HostReservationCard({
  reservation,
  statusConfig,
  onViewDetails,
  onReviewGuest, // 🆕 Acción expuesta
  isSelected,
}: {
  reservation: HostReservation;
  statusConfig: Record<string, StatusConfig>;
  onViewDetails?: (reservation: HostReservation) => void;
  onReviewGuest?: (reservation: HostReservation) => void; // 🆕
  isSelected?: boolean;
}) {
  return (
    <ReservationCard
      reservation={reservation}
      statusConfig={statusConfig}
      variant="host"
      onAction={onViewDetails}
      onReview={onReviewGuest} // Conectado
      isSelected={isSelected}
    />
  );
}

// Wrapper Guest
export function GuestReservationCard({
  reservation,
  statusConfig,
  onChatWithHost,
  onCancelReservation,
  onLeaveReview,
  canStartChat,
}: {
  reservation: GuestReservation;
  statusConfig: Record<string, StatusConfig>;
  onChatWithHost?: (reservation: GuestReservation) => void;
  onCancelReservation?: (reservation: GuestReservation) => void;
  onLeaveReview?: (reservation: GuestReservation) => void;
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
      onCancel={onCancelReservation}
      onReview={onLeaveReview}
    />
  );
}