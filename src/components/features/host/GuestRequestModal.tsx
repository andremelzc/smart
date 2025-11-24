"use client";

import { useEffect, useState, startTransition } from "react";
import {
  X,
  Calendar,
  User,
  Hash,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Check,
  XCircle,
  Star,
  AlertTriangle,
  Edit3,
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";

type ReservationStatus =
  | "pending"
  | "confirmed"
  | "accepted"
  | "completed"
  | "declined"
  | "cancelled";

export type DetailedReservation = {
  id: string;
  guestName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  status: ReservationStatus;
  roomId?: string; // PROPERTY_ID del SP

  // Información financiera
  basePrice?: number;
  serviceFee?: number;
  totalAmount: number;

  // Información de contacto (solo para confirmed/completed)
  contactEmail?: string;
  contactPhone?: string;

  // Información adicional
  profileImageUrl?: string;
  propertyAddress?: string;
  hostNote?: string;
  checkinCode?: string;
  createdAt: string;
  completedAt?: string;

  // Mensajes y reseñas
  guestMessage?: string;
  paymentStatus?: string;
  paymentMessage?: string;
  hasHostReview?: boolean;
  hasGuestReview?: boolean;
};

type GuestRequestModalProps = {
  open: boolean;
  onClose: () => void;
  request: DetailedReservation | null;
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
  onSendMessage?: (requestId: string) => void;
  onWriteReview?: (requestId: string) => void;
  onViewReviews?: (requestId: string) => void;
  onViewMessages?: (requestId: string) => void;
  onModifyReservation?: (requestId: string) => void;
};

export default function GuestRequestModal({
  open,
  onClose,
  request,
  onAccept,
  onDecline,
  onCancel,
  onSendMessage,
  onWriteReview,
  onViewReviews,
  onViewMessages,
  onModifyReservation,
}: GuestRequestModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timeout);
    }

    startTransition(() => {
      setIsVisible(false);
    });

    return undefined;
  }, [open]);

  if (!open || !request) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 180);
  };

  // Configuración dinámica basada en el estado
  const getStatusConfig = (status: ReservationStatus) => {
    switch (status) {
      case "pending":
        return {
          title: "Solicitud de Huésped",
          statusText: "Pendiente de revisión",
          statusColor: "text-yellow-700 bg-yellow-100",
          showContact: false,
          showFinancial: true,
          showPrivacy: true,
        };
      case "accepted":
        return {
          title: "Reserva Confirmada",
          statusText: "Confirmada",
          statusColor: "text-green-700 bg-green-100",
          showContact: true,
          showFinancial: true,
          showPrivacy: false,
        };
        
      case "completed":
        return {
          title: "Reserva Completada",
          statusText: "Completada",
          statusColor: "text-blue-700 bg-blue-100",
          showContact: true,
          showFinancial: true,
          showPrivacy: false,
        };
      case "declined":
        return {
          title: "Solicitud Rechazada",
          statusText: "Rechazada",
          statusColor: "text-red-700 bg-red-100",
          showContact: false,
          showFinancial: false,
          showPrivacy: true,
        };
      case "cancelled":
        return {
          title: "Reserva Cancelada",
          statusText: "Cancelada",
          statusColor: "text-gray-700 bg-gray-100",
          showContact: false,
          showFinancial: true,
          showPrivacy: true,
        };
      default:
        return {
          title: "Detalle de Reserva",
          statusText: "Sin definir",
          statusColor: "text-gray-700 bg-gray-100",
          showContact: false,
          showFinancial: false,
          showPrivacy: true,
        };
    }
  };

  const config = getStatusConfig(request.status);

  // Formatear fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateRange = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const formatter = new Intl.DateTimeFormat("es-PE", {
      month: "long",
      day: "numeric",
    });
    return {
      checkIn: formatter.format(checkInDate),
      checkOut: formatter.format(checkOutDate),
    };
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  const dates = formatDateRange(request.checkIn, request.checkOut);

  return (
    <div
      className={`bg-gray-dark-500/60 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`max-h-[90vh] w-full max-w-4xl transform overflow-y-auto rounded-2xl bg-white shadow-2xl transition-all duration-200 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header con información principal */}
        <header className="from-blue-light-500 to-blue-vivid-500 relative rounded-t-2xl bg-gradient-to-r px-8 py-6 text-white">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-6">
            <span className="text-blue-light-100 mb-2 block text-xs font-semibold tracking-wide uppercase">
              {config.title}
            </span>
            <h1 className="mb-2 text-3xl font-bold">{request.guestName}</h1>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.statusColor}`}
              >
                {config.statusText}
              </span>
              <span className="text-blue-light-50 text-sm">
                {request.status === "completed" && request.completedAt
                  ? `Completada el ${formatDate(request.completedAt)}`
                  : request.status === "declined"
                    ? `Rechazada el ${formatDate(request.createdAt)}`
                    : `Recibida el ${formatDate(request.createdAt)}`}
              </span>
            </div>
          </div>

          {/* Resumen rápido de la reserva */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-blue-light-100 mb-2 text-xs font-semibold tracking-wide uppercase">
                Propiedad
              </h2>
              <p className="text-lg font-bold">{request.propertyName}</p>
              {request.roomId && (
                <p className="text-blue-light-50 mt-1 text-sm">
                  Habitación {request.roomId}
                </p>
              )}
            </div>
            <div>
              <h2 className="text-blue-light-100 mb-2 text-xs font-semibold tracking-wide uppercase">
                Fechas
              </h2>
              <p className="text-lg font-bold">{dates.checkIn}</p>
              <p className="text-blue-light-50 text-sm">
                hasta {dates.checkOut}
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-8 px-8 py-6">
          {/* Mensaje del Huésped - Lo más importante primero si existe */}
          {request.guestMessage && request.status === "pending" && (
            <section>
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Mensaje del Huésped
              </h2>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                <p className="text-base leading-relaxed text-gray-800">
                  {request.guestMessage}
                </p>
              </div>
            </section>
          )}

          {/* Detalles de la Reserva */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Detalles de la Reserva
            </h2>

            <div className="space-y-4">
              {/* Info básica en cards pequeñas */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                      Huéspedes
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {request.guestCount}{" "}
                      {request.guestCount === 1 ? "persona" : "personas"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                      Check-in
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {dates.checkIn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                      Check-out
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {dates.checkOut}
                    </p>
                  </div>
                </div>

                {request.roomId && (
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                      <Hash className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                        Habitación
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {request.roomId}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Información Financiera */}
          {config.showFinancial && (
            <section>
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                {request.status === "pending"
                  ? "Desglose de Precio"
                  : "Información de Pago"}
              </h2>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                <div className="space-y-3">
                  {request.basePrice && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-700">Precio base</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(request.basePrice)}
                      </span>
                    </div>
                  )}

                  {request.serviceFee && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-700">Tarifa de servicio</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(request.serviceFee)}
                      </span>
                    </div>
                  )}

                  <div className="mt-3 border-t-2 border-gray-300 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        {request.status === "pending"
                          ? "Total"
                          : "Total Pagado"}
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(request.totalAmount)}
                      </span>
                    </div>
                    {request.paymentStatus && (
                      <p className="mt-2 text-sm text-gray-600">
                        Estado del pago: {request.paymentStatus}
                      </p>
                    )}
                  </div>
                </div>

                {request.paymentMessage && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      {request.paymentMessage}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Información de Contacto */}
          {config.showContact &&
            request.contactEmail &&
            request.contactPhone && (
              <section>
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Información de Contacto
                </h2>

                <div className="space-y-4 rounded-xl border border-blue-200 bg-blue-50 p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <a
                      href={`mailto:${request.contactEmail}`}
                      className="group flex items-center gap-3 rounded-lg border border-blue-200 bg-white p-4 transition-colors hover:border-blue-400"
                    >
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                          Email
                        </p>
                        <p className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                          {request.contactEmail}
                        </p>
                      </div>
                    </a>

                    <a
                      href={`tel:${request.contactPhone}`}
                      className="group flex items-center gap-3 rounded-lg border border-blue-200 bg-white p-4 transition-colors hover:border-blue-400"
                    >
                      <Phone className="h-5 w-5 text-blue-600" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                          Teléfono
                        </p>
                        <p className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                          {request.contactPhone}
                        </p>
                      </div>
                    </a>
                  </div>

                  {/* Código de Check-in */}
                  {request.checkinCode && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500">
                          <Hash className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-sm font-bold text-green-900">
                          Código de Check-in
                        </h3>
                      </div>
                      <div className="ml-11">
                        <p className="inline-block rounded-md border border-green-300 bg-white px-4 py-2 font-mono text-2xl font-bold tracking-wider text-green-800">
                          {request.checkinCode}
                        </p>
                        <p className="mt-2 text-xs text-green-700">
                          Comparte este código con el huésped para el acceso a
                          la propiedad
                        </p>
                      </div>
                    </div>
                  )}

                  {request.propertyAddress && (
                    <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-white p-4">
                      <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                      <div className="flex-1">
                        <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                          Dirección de la propiedad
                        </p>
                        <p className="text-sm leading-relaxed font-semibold text-gray-900">
                          {request.propertyAddress}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

          {/* Notas del Host */}
          {request.status === "accepted" && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Notas para el Huésped
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancelar" : "Editar"}
                </Button>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    className="w-full resize-none rounded-lg border border-gray-300 p-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Agregar instrucciones especiales, códigos de acceso, recomendaciones..."
                    defaultValue={request.hostNote || ""}
                  />
                  <div className="flex gap-2">
                    <Button size="sm">Guardar Notas</Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-base leading-relaxed text-gray-700">
                    {request.hostNote ||
                      "Sin notas adicionales para este huésped"}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Reseñas */}
          {request.status === "completed" && (
            <section>
              <h2 className="mb-4 text-xl font-bold text-gray-900">Reseñas</h2>

              <div className="space-y-3">
                {!request.hasHostReview && (
                  <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <Star className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="mb-1 font-semibold text-blue-900">
                        Reseña pendiente
                      </p>
                      <p className="text-sm text-blue-800">
                        Comparte tu experiencia con{" "}
                        {request.guestName.split(" ")[0]}
                      </p>
                    </div>
                  </div>
                )}

                {request.hasHostReview && (
                  <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div>
                      <p className="mb-1 font-semibold text-green-900">
                        Reseña enviada
                      </p>
                      <p className="text-sm text-green-800">
                        Has completado la reseña para este huésped
                      </p>
                    </div>
                  </div>
                )}

                {request.hasGuestReview && (
                  <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <MessageSquare className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                    <div>
                      <p className="mb-1 font-semibold text-yellow-900">
                        Nueva reseña recibida
                      </p>
                      <p className="text-sm text-yellow-800">
                        {request.guestName.split(" ")[0]} ha dejado una reseña
                        sobre su estadía
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Alertas para declined/cancelled */}
          {(request.status === "declined" ||
            request.status === "cancelled") && (
            <section>
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-5">
                <AlertTriangle className="mt-1 h-6 w-6 flex-shrink-0 text-red-600" />
                <div>
                  <h3 className="mb-2 text-lg font-bold text-red-900">
                    {request.status === "declined"
                      ? "Solicitud Rechazada"
                      : "Reserva Cancelada"}
                  </h3>
                  <p className="text-sm leading-relaxed text-red-800">
                    {request.status === "declined"
                      ? `Esta solicitud fue rechazada el ${formatDate(request.createdAt)}.`
                      : "Esta reserva ha sido cancelada y ya no está activa."}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Botones de Acción */}
          <section className="flex flex-wrap gap-3 border-t border-gray-200 pt-6">
            {request.status === "pending" && (
              <>
                <Button
                  onClick={() => onAccept?.(request.id)}
                  className="bg-green-600 hover:bg-green-700"
                  leftIcon={Check}
                >
                  Aceptar Solicitud
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => onDecline?.(request.id)}
                  leftIcon={XCircle}
                  className=""
                >
                  Rechazar
                </Button>
              </>
            )}

            {request.status === "accepted" && (
              <>
                <Button
                  onClick={() => onSendMessage?.(request.id)}
                  leftIcon={MessageSquare}
                >
                  Enviar Mensaje
                </Button>
                {onModifyReservation && (
                  <Button
                    variant="ghost"
                    onClick={() => onModifyReservation(request.id)}
                    leftIcon={Edit3}
                  >
                    Modificar Reserva
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => onCancel?.(request.id)}
                  leftIcon={XCircle}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Cancelar Reserva
                </Button>
              </>
            )}

            {request.status === "completed" && (
              <>
                {!request.hasHostReview && onWriteReview && (
                  <Button
                    onClick={() => onWriteReview(request.id)}
                    leftIcon={Star}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Escribir Reseña
                  </Button>
                )}
                {(request.hasHostReview || request.hasGuestReview) &&
                  onViewReviews && (
                    <Button
                      onClick={() => onViewReviews(request.id)}
                      leftIcon={Star}
                    >
                      Ver Reseñas
                    </Button>
                  )}
                <Button
                  variant="ghost"
                  onClick={() => onViewMessages?.(request.id)}
                  leftIcon={MessageSquare}
                >
                  Ver Mensajes
                </Button>
              </>
            )}

            {request.status === "cancelled" && onViewMessages && (
              <Button
                variant="ghost"
                onClick={() => onViewMessages(request.id)}
                leftIcon={MessageSquare}
              >
                Ver Historial
              </Button>
            )}

            {request.status === "declined" && (
              <Button variant="ghost" onClick={handleClose}>
                Cerrar
              </Button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
