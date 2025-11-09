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
  Edit3
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";

type ReservationStatus = "pending" | "confirmed" | "completed" | "declined" | "cancelled";

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
          showPrivacy: true
        };
      case "confirmed":
        return {
          title: "Reserva Confirmada",
          statusText: "Confirmada",
          statusColor: "text-green-700 bg-green-100",
          showContact: true,
          showFinancial: true,
          showPrivacy: false
        };
      case "completed":
        return {
          title: "Reserva Completada",
          statusText: "Completada",
          statusColor: "text-blue-700 bg-blue-100",
          showContact: true,
          showFinancial: true,
          showPrivacy: false
        };
      case "declined":
        return {
          title: "Solicitud Rechazada",
          statusText: "Rechazada",
          statusColor: "text-red-700 bg-red-100",
          showContact: false,
          showFinancial: false,
          showPrivacy: true
        };
      case "cancelled":
        return {
          title: "Reserva Cancelada",
          statusText: "Cancelada",
          statusColor: "text-gray-700 bg-gray-100",
          showContact: false,
          showFinancial: true,
          showPrivacy: true
        };
      default:
        return {
          title: "Detalle de Reserva",
          statusText: "Sin definir",
          statusColor: "text-gray-700 bg-gray-100",
          showContact: false,
          showFinancial: false,
          showPrivacy: true
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
      checkOut: formatter.format(checkOutDate)
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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-dark-500/60 backdrop-blur-sm p-4 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto transform rounded-2xl bg-white shadow-2xl transition-all duration-200 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header con información principal */}
        <header className="relative rounded-t-2xl bg-gradient-to-r from-blue-light-500 to-blue-vivid-500 px-8 py-6 text-white">
          <button
            onClick={handleClose}
            className="absolute right-5 top-5 rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-light-100 mb-2 block">
              {config.title}
            </span>
            <h1 className="text-3xl font-bold mb-2">{request.guestName}</h1>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.statusColor}`}>
                {config.statusText}
              </span>
              <span className="text-sm text-blue-light-50">
                {request.status === "completed" && request.completedAt 
                  ? `Completada el ${formatDate(request.completedAt)}`
                  : request.status === "declined" 
                  ? `Rechazada el ${formatDate(request.createdAt)}`
                  : `Recibida el ${formatDate(request.createdAt)}`
                }
              </span>
            </div>
          </div>

          {/* Resumen rápido de la reserva */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-blue-light-100 mb-2">Propiedad</h2>
              <p className="text-lg font-bold">{request.propertyName}</p>
              {request.roomId && (
                <p className="text-sm text-blue-light-50 mt-1">Habitación {request.roomId}</p>
              )}
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-blue-light-100 mb-2">Fechas</h2>
              <p className="text-lg font-bold">{dates.checkIn}</p>
              <p className="text-sm text-blue-light-50">hasta {dates.checkOut}</p>
            </div>
          </div>
        </header>

        <div className="px-8 py-6 space-y-8">
          {/* Mensaje del Huésped - Lo más importante primero si existe */}
          {request.guestMessage && request.status === "pending" && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Mensaje del Huésped</h2>
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <p className="text-base leading-relaxed text-gray-800">{request.guestMessage}</p>
              </div>
            </section>
          )}

          {/* Detalles de la Reserva */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Detalles de la Reserva</h2>
            
            <div className="space-y-4">
              {/* Info básica en cards pequeñas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Huéspedes</p>
                    <p className="text-lg font-bold text-gray-900">
                      {request.guestCount} {request.guestCount === 1 ? 'persona' : 'personas'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Check-in</p>
                    <p className="text-lg font-bold text-gray-900">{dates.checkIn}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Check-out</p>
                    <p className="text-lg font-bold text-gray-900">{dates.checkOut}</p>
                  </div>
                </div>

                {request.roomId && (
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                      <Hash className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Habitación</p>
                      <p className="text-lg font-bold text-gray-900">{request.roomId}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Información Financiera */}
          {config.showFinancial && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {request.status === "pending" ? "Desglose de Precio" : "Información de Pago"}
              </h2>
              
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="space-y-3">
                  {request.basePrice && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700">Precio base</span>
                      <span className="text-lg font-semibold text-gray-900">{formatCurrency(request.basePrice)}</span>
                    </div>
                  )}
                  
                  {request.serviceFee && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700">Tarifa de servicio</span>
                      <span className="text-lg font-semibold text-gray-900">{formatCurrency(request.serviceFee)}</span>
                    </div>
                  )}
                  
                  <div className="border-t-2 border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        {request.status === "pending" ? "Total" : "Total Pagado"}
                      </span>
                      <span className="text-2xl font-bold text-blue-600">{formatCurrency(request.totalAmount)}</span>
                    </div>
                    {request.paymentStatus && (
                      <p className="text-sm text-gray-600 mt-2">Estado del pago: {request.paymentStatus}</p>
                    )}
                  </div>
                </div>

                {request.paymentMessage && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">{request.paymentMessage}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Información de Contacto */}
          {config.showContact && request.contactEmail && request.contactPhone && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Información de Contacto</h2>
              
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a 
                    href={`mailto:${request.contactEmail}`}
                    className="group flex items-center gap-3 bg-white rounded-lg p-4 border border-blue-200 hover:border-blue-400 transition-colors"
                  >
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {request.contactEmail}
                      </p>
                    </div>
                  </a>
                  
                  <a 
                    href={`tel:${request.contactPhone}`}
                    className="group flex items-center gap-3 bg-white rounded-lg p-4 border border-blue-200 hover:border-blue-400 transition-colors"
                  >
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Teléfono</p>
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {request.contactPhone}
                      </p>
                    </div>
                  </a>
                </div>

                {/* Código de Check-in */}
                {request.checkinCode && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500">
                        <Hash className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-sm font-bold text-green-900">Código de Check-in</h3>
                    </div>
                    <div className="ml-11">
                      <p className="text-2xl font-mono font-bold text-green-800 tracking-wider bg-white px-4 py-2 rounded-md border border-green-300 inline-block">
                        {request.checkinCode}
                      </p>
                      <p className="text-xs text-green-700 mt-2">
                        Comparte este código con el huésped para el acceso a la propiedad
                      </p>
                    </div>
                  </div>
                )}

                {request.propertyAddress && (
                  <div className="flex items-start gap-3 bg-white rounded-lg p-4 border border-blue-200">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Dirección de la propiedad</p>
                      <p className="text-sm font-semibold text-gray-900 leading-relaxed">{request.propertyAddress}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Notas del Host */}
          {request.status === "confirmed" && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Notas para el Huésped</h2>
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
                    className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Agregar instrucciones especiales, códigos de acceso, recomendaciones..."
                    defaultValue={request.hostNote || ""}
                  />
                  <div className="flex gap-2">
                    <Button size="sm">Guardar Notas</Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <p className="text-base leading-relaxed text-gray-700">
                    {request.hostNote || "Sin notas adicionales para este huésped"}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Reseñas */}
          {request.status === "completed" && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Reseñas</h2>
              
              <div className="space-y-3">
                {!request.hasHostReview && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <Star className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">Reseña pendiente</p>
                      <p className="text-sm text-blue-800">
                        Comparte tu experiencia con {request.guestName.split(' ')[0]}
                      </p>
                    </div>
                  </div>
                )}
                
                {request.hasHostReview && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-900 mb-1">Reseña enviada</p>
                      <p className="text-sm text-green-800">
                        Has completado la reseña para este huésped
                      </p>
                    </div>
                  </div>
                )}
                
                {request.hasGuestReview && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-yellow-900 mb-1">Nueva reseña recibida</p>
                      <p className="text-sm text-yellow-800">
                        {request.guestName.split(' ')[0]} ha dejado una reseña sobre su estadía
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Alertas para declined/cancelled */}
          {(request.status === "declined" || request.status === "cancelled") && (
            <section>
              <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-2">
                    {request.status === "declined" ? "Solicitud Rechazada" : "Reserva Cancelada"}
                  </h3>
                  <p className="text-sm text-red-800 leading-relaxed">
                    {request.status === "declined" 
                      ? `Esta solicitud fue rechazada el ${formatDate(request.createdAt)}.`
                      : "Esta reserva ha sido cancelada y ya no está activa."
                    }
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Botones de Acción */}
          <section className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
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
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Rechazar
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => onSendMessage?.(request.id)}
                  leftIcon={MessageSquare}
                >
                  Enviar Mensaje
                </Button>
              </>
            )}

            {request.status === "confirmed" && (
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
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                {(request.hasHostReview || request.hasGuestReview) && onViewReviews && (
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