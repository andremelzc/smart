"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Phone,
  UserRound,
  XCircle,
} from "lucide-react";
import { useNotifications } from "@/src/hooks/useNotifications";
import type {
  NotificationItem,
  NotificationStatus,
} from "@/src/types/dtos/notifications.dto";
import { bookingService } from "@/src/services/booking.service";

const STATUS_LABELS: Record<NotificationStatus, string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptada",
  DECLINED: "Rechazada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
};

const STATUS_STYLES: Record<NotificationStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ACCEPTED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  DECLINED: "bg-red-100 text-red-700 border-red-200",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
  COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
};

const STATUS_FILTERS: Array<{
  value: "all" | NotificationStatus;
  label: string;
}> = [
  { value: "all", label: "Todos" },
  { value: "PENDING", label: "Pendientes" },
  { value: "ACCEPTED", label: "Aceptadas" },
  { value: "DECLINED", label: "Rechazadas" },
  { value: "CANCELLED", label: "Canceladas" },
  { value: "COMPLETED", label: "Completadas" },
];

const SUMMARY_ORDER: NotificationStatus[] = [
  "PENDING",
  "ACCEPTED",
  "CANCELLED",
];

const PAGE_SIZE = 8;

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return "—";
  }
  try {
    return new Date(value).toLocaleString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: currency || "PEN",
    }).format(amount);
  } catch {
    return `S/ ${amount.toFixed(2)}`;
  }
};

const NotificationBadge = ({
  status,
  isCheckinReminder = false,
}: {
  status: NotificationStatus;
  isCheckinReminder?: boolean;
}) => {
  const badgeClass = isCheckinReminder
    ? status === "ACCEPTED"
      ? "border-yellow-200 bg-yellow-50 text-yellow-700"
      : "border-rose-200 bg-rose-50 text-rose-600"
    : STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
};

const NotificationTimeline = ({
  notification,
}: {
  notification: NotificationItem;
}) => {
  const events: Array<{ label: string; value: string | null }> = [
    { label: "Creada", value: notification.createdAt },
  ];

  if (notification.status === "ACCEPTED") {
    events.push({
      label: "Aprobada",
      value: notification.eventAt ?? notification.createdAt,
    });
  }

  if (notification.status === "DECLINED") {
    events.push({
      label: "Rechazada",
      value: notification.eventAt ?? notification.createdAt,
    });
  }

  if (notification.status === "CANCELLED") {
    events.push({
      label: "Cancelada",
      value: notification.eventAt ?? notification.createdAt,
    });
  }

  if (notification.status === "COMPLETED") {
    events.push({
      label: "Completada",
      value: notification.eventAt ?? notification.createdAt,
    });
  }

  return (
    <ol className="text-gray-dark-600 flex flex-col gap-2 text-sm">
      {events.map((event) => (
        <li
          key={event.label}
          className="bg-blue-light-50 flex items-center justify-between rounded-xl px-3 py-2"
        >
          <span className="text-gray-dark-700 font-medium">{event.label}</span>
          <span>{formatDateTime(event.value)}</span>
        </li>
      ))}
    </ol>
  );
};

type DraftNotes = Record<number, string>;

export default function NotificationsPage() {
  const {
    notifications,
    loading,
    error,
    refresh,
    updateNotification,
    statusCounts,
  } = useNotifications({ role: "tenant" });
  const [statusFilter, setStatusFilter] = useState<"all" | NotificationStatus>(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeBooking, setActiveBooking] = useState<number | null>(null);
  const [draftNotes, setDraftNotes] = useState<DraftNotes>({});
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (statusFilter !== "all" && notification.status !== statusFilter) {
        return false;
      }
      if (searchTerm.trim().length > 0) {
        const term = searchTerm.trim().toLowerCase();
        const haystack =
          `${notification.propertyTitle} ${notification.hostName ?? ""} ${notification.tenantName ?? ""}`.toLowerCase();
        return haystack.includes(term);
      }
      return true;
    });
  }, [notifications, statusFilter, searchTerm]);

  const totalItems = filteredNotifications.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredNotifications.slice(start, start + PAGE_SIZE);
  }, [filteredNotifications, currentPage]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem =
    totalItems === 0 ? 0 : Math.min(totalItems, currentPage * PAGE_SIZE);
  const showPagination = totalItems > PAGE_SIZE;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (filteredNotifications.length === 0) {
      setActiveBooking(null);
      return;
    }
    setActiveBooking((prev) => {
      if (
        prev &&
        filteredNotifications.some((item) => item.bookingId === prev)
      ) {
        return prev;
      }
      return filteredNotifications[0]?.bookingId ?? null;
    });
  }, [filteredNotifications]);

  useEffect(() => {
    if (paginatedNotifications.length === 0) {
      return;
    }
    setActiveBooking((prev) => {
      if (
        prev &&
        paginatedNotifications.some((item) => item.bookingId === prev)
      ) {
        return prev;
      }
      return paginatedNotifications[0]?.bookingId ?? null;
    });
  }, [paginatedNotifications]);

  const activeNotification =
    filteredNotifications.find((item) => item.bookingId === activeBooking) ??
    null;

  const currentDraftNote = activeBooking
    ? (draftNotes[activeBooking] ?? "")
    : "";

  const handleDraftChange = (value: string) => {
    if (!activeBooking) {
      return;
    }
    setDraftNotes((prev) => ({ ...prev, [activeBooking]: value }));
  };

  const runAction = async () => {
    if (!activeNotification) {
      return;
    }

    setActionMessage(null);
    setActionError(null);
    setActionLoading(true);

    try {
      await bookingService.cancelBookingAsTenant(
        activeNotification.bookingId,
        currentDraftNote
      );
      updateNotification(activeNotification.bookingId, {
        status: "CANCELLED",
        tenantNote: currentDraftNote || activeNotification.tenantNote,
        eventAt: new Date().toISOString(),
      });
      setActionMessage("Reserva cancelada con exito.");
      await refresh();
    } catch (err) {
      console.error("Error al ejecutar accion de notificacion:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Ocurrio un error al procesar la accion";
      setActionError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const canCancel = activeNotification?.status === "ACCEPTED";

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="text-blue-light-600 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span className="text-sm font-semibold">
            Gestiona tus notificaciones de reservas
          </span>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-gray-dark-900 text-3xl font-semibold">
              Notificaciones
            </h1>
            <p className="text-gray-dark-600">
              Revisa las solicitudes pendientes, actualizaciones de estado y
              acciones requeridas en tus reservas.
            </p>
          </div>
          <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
            {SUMMARY_ORDER.map((status) => (
              <div
                key={status}
                className="border-blue-light-150 rounded-3xl border bg-white/80 px-5 py-3 text-center text-sm shadow-sm"
              >
                <p className="text-gray-dark-500 text-xs font-medium uppercase">
                  {STATUS_LABELS[status]}
                </p>
                <p className="text-gray-dark-800 text-lg font-semibold">
                  {statusCounts[status] ?? 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="border-blue-light-150 rounded-3xl border bg-white/80 p-5 shadow-sm sm:p-7 lg:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="text-gray-dark-600 flex-shrink-0 text-sm font-semibold tracking-wide uppercase">
            Vista de huésped
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto">
            <div className="relative min-w-[200px] flex-grow sm:min-w-[250px] md:min-w-[300px] lg:min-w-[350px]">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por propiedad o anfitrión"
                className="border-blue-light-200 text-gray-dark-700 focus:border-blue-light-400 focus:ring-blue-light-200 w-full rounded-full border bg-white/70 px-4 py-2 text-sm shadow-sm focus:ring-2 focus:outline-none"
              />
              <span className="text-gray-dark-400 pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <MessageSquare className="h-4 w-4" />
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    statusFilter === filter.value
                      ? "border-blue-vivid-500 bg-blue-vivid-50 text-blue-vivid-700"
                      : "border-blue-light-200 text-gray-dark-500 hover:border-blue-light-300"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] xl:gap-8">
          <aside className="border-blue-light-100 flex h-full flex-col rounded-3xl border bg-white/90 p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-gray-dark-700 text-sm font-semibold">
                Listado
              </span>
              {loading && (
                <Loader2 className="text-blue-light-500 h-4 w-4 animate-spin" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
              {filteredNotifications.length === 0 && !loading ? (
                <p className="border-blue-light-200 text-gray-dark-500 rounded-2xl border border-dashed bg-white px-4 py-8 text-center text-sm">
                  No hay notificaciones para los filtros seleccionados.
                </p>
              ) : (
                paginatedNotifications.map((notification) => {
                  const hasCheckinReminder =
                    notification.reminderType === "CHECKIN_24H";
                  return (
                    <button
                      key={`${notification.bookingId}-${notification.role}`}
                      type="button"
                      onClick={() => setActiveBooking(notification.bookingId)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        notification.bookingId === activeBooking
                          ? "border-blue-vivid-500 bg-white shadow-md"
                          : "border-blue-light-100 hover:border-blue-light-200 bg-white/70 hover:bg-white"
                      }`}
                    >
                      <div className="text-gray-dark-500 flex items-center justify-between text-xs">
                        <span className="text-gray-dark-700 font-semibold">
                          #{notification.bookingId}
                        </span>
                        <NotificationBadge
                          status={notification.status}
                          isCheckinReminder={hasCheckinReminder}
                        />
                      </div>
                      <p className="text-gray-dark-800 mt-1 line-clamp-2 text-sm font-semibold">
                        {notification.propertyTitle}
                      </p>
                      <p className="text-gray-dark-500 text-xs">
                        {notification.role === "host"
                          ? `Huésped: ${notification.tenantName ?? "Sin datos"}`
                          : `Anfitrión: ${notification.hostName ?? "Sin datos"}`}
                      </p>
                      <p className="text-gray-dark-400 mt-1 text-xs">
                        Creada {formatDateTime(notification.createdAt)}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
            {showPagination && (
              <div className="text-gray-dark-500 mt-4 flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Mostrando {startItem}-{endItem} de {totalItems}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="border-blue-light-200 text-gray-dark-600 hover:border-blue-light-300 rounded-full border px-3 py-1 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Anterior
                  </button>
                  <div className="border-blue-light-200 text-gray-dark-600 rounded-full border bg-white px-3 py-1 font-semibold">
                    {currentPage} / {totalPages}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="border-blue-light-200 text-gray-dark-600 hover:border-blue-light-300 rounded-full border px-3 py-1 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </aside>

          <section className="border-blue-light-100 flex h-full flex-col rounded-3xl border bg-white/90 p-6 shadow-sm lg:p-8">
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {!activeNotification ? (
              <div className="text-gray-dark-500 flex h-full flex-col items-center justify-center text-center text-sm">
                {loading ? (
                  <>
                    <Loader2 className="text-blue-light-500 h-6 w-6 animate-spin" />
                    <p className="mt-2">Cargando notificaciones...</p>
                  </>
                ) : (
                  <>
                    <Bell className="text-blue-light-300 h-8 w-8" />
                    <p className="mt-2">
                      Selecciona una notificación para ver los detalles.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="flex-1 space-y-6">
                <header className="border-blue-light-100 flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <NotificationBadge
                        status={activeNotification.status}
                        isCheckinReminder={
                          activeNotification.reminderType === "CHECKIN_24H"
                        }
                      />
                      <span className="text-gray-dark-400 text-xs font-semibold">
                        #{activeNotification.bookingId}
                      </span>
                    </div>
                    <h2 className="text-gray-dark-900 text-2xl font-semibold">
                      {activeNotification.propertyTitle}
                    </h2>
                  </div>
                  <div className="border-blue-light-100 bg-blue-light-50 text-gray-dark-600 flex flex-col items-start gap-2 rounded-2xl border px-4 py-3 text-sm lg:items-end">
                    <div className="text-gray-dark-700 flex items-center gap-2 font-medium">
                      <Calendar className="text-blue-light-500 h-4 w-4" />
                      Check-in {formatDateTime(activeNotification.checkinDate)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="text-blue-light-500 h-4 w-4" />
                      Check-out{" "}
                      {formatDateTime(activeNotification.checkoutDate)}
                    </div>
                  </div>
                </header>

                <div className="flex flex-wrap gap-6">
                  <div className="border-blue-light-100 min-w-[300px] flex-1 rounded-2xl border bg-white/70 p-5">
                    <h3 className="text-gray-dark-700 mb-3 flex items-center gap-2 text-sm font-semibold">
                      <UserRound className="text-blue-light-500 h-4 w-4" />
                      Involucrados
                    </h3>
                    <ul className="text-gray-dark-600 space-y-3 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="text-blue-light-500 h-4 w-4" />
                        Anfitrión: {activeNotification.hostName ?? "Sin datos"}
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="text-blue-light-500 h-4 w-4" />
                        Huésped: {activeNotification.tenantName ?? "Sin datos"}
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="text-blue-light-500 h-4 w-4" />
                        Última actualización:{" "}
                        {formatDateTime(
                          activeNotification.eventAt ??
                            activeNotification.createdAt
                        )}
                      </li>
                    </ul>
                  </div>
                  <div className="border-blue-light-100 min-w-[300px] flex-1 rounded-2xl border bg-white/70 p-5">
                    <h3 className="text-gray-dark-700 mb-3 flex items-center gap-2 text-sm font-semibold">
                      <Calendar className="text-blue-light-500 h-4 w-4" />
                      Linea de tiempo
                    </h3>
                    <NotificationTimeline notification={activeNotification} />
                  </div>
                  <div className="border-blue-light-100 min-w-[300px] flex-1 rounded-2xl border bg-white/70 p-5">
                    <h3 className="text-gray-dark-700 mb-3 flex items-center gap-2 text-sm font-semibold">
                      <Bell className="text-blue-light-500 h-4 w-4" />
                      Resumen de la reserva
                    </h3>
                    <div className="text-gray-dark-600 space-y-3 text-sm">
                      <p className="flex items-center gap-2">
                        <Clock className="text-blue-light-500 h-4 w-4" />
                        Creada {formatDateTime(activeNotification.createdAt)}
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="text-blue-light-500 h-4 w-4" />
                        Estado:{" "}
                        <span className="text-gray-dark-800 font-semibold">
                          {STATUS_LABELS[activeNotification.status]}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="text-blue-light-500 h-4 w-4" />
                        Total reservado:
                        <span className="text-gray-dark-800 font-semibold">
                          {formatCurrency(
                            activeNotification.totalAmount,
                            activeNotification.currencyCode
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {activeNotification.reminderType === "CHECKIN_24H" && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="mt-1 h-5 w-5 text-rose-500" />
                      <div className="text-gray-dark-700 space-y-1 text-sm">
                        <p className="font-semibold text-rose-600">
                          Tu check-in está a menos de 24 horas
                        </p>
                        <p>
                          Revisa tu plan de llegada y mantén tus datos de
                          contacto actualizados. El check-in está programado
                          para{" "}
                          <span className="font-semibold">
                            {formatDateTime(activeNotification.checkinDate)}
                          </span>
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-blue-light-100 rounded-2xl border bg-white/70 p-5">
                  <h3 className="text-gray-dark-700 mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Clock className="text-blue-light-500 h-4 w-4" />
                    Notas y comentarios
                  </h3>
                  <div
                    className={`flex flex-col gap-6 ${canCancel ? "lg:flex-row" : ""}`}
                  >
                    <div className="flex-1 space-y-3">
                      {activeNotification.hostNote && (
                        <p className="border-blue-light-100 text-gray-dark-600 rounded-xl border bg-white px-4 py-3 text-sm">
                          <span className="text-gray-dark-700 font-semibold">
                            Nota del anfitrión:
                          </span>{" "}
                          {activeNotification.hostNote}
                        </p>
                      )}
                      {activeNotification.tenantNote && (
                        <p className="border-blue-light-100 text-gray-dark-600 rounded-xl border bg-white px-4 py-3 text-sm">
                          <span className="text-gray-dark-700 font-semibold">
                            Motivo del huésped:
                          </span>{" "}
                          {activeNotification.tenantNote}
                        </p>
                      )}
                      {!activeNotification.hostNote &&
                        !activeNotification.tenantNote && (
                          <p className="border-blue-light-150 text-gray-dark-500 rounded-xl border border-dashed bg-white/60 px-4 py-3 text-sm">
                            No hay notas registradas para esta reserva.
                          </p>
                        )}
                    </div>
                    {canCancel && (
                      <div className="border-blue-light-100 text-gray-dark-600 w-full space-y-3 rounded-2xl border bg-white px-5 py-4 text-sm shadow-sm lg:max-w-sm">
                        <label className="text-gray-dark-700 block text-sm font-medium">
                          Motivo de la cancelación (opcional)
                          <textarea
                            value={currentDraftNote}
                            onChange={(event) =>
                              handleDraftChange(event.target.value)
                            }
                            className="border-blue-light-200 text-gray-dark-700 focus:border-blue-light-400 focus:ring-blue-light-200 mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm focus:ring-2 focus:outline-none"
                            rows={3}
                            placeholder="Explica por qué necesitas cancelar"
                          />
                        </label>
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={runAction}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <XCircle className="h-4 w-4" /> Cancelar reserva
                          </button>
                          {actionLoading && (
                            <Loader2 className="text-blue-light-500 h-4 w-4 animate-spin" />
                          )}
                        </div>
                        {actionMessage && (
                          <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            {actionMessage}
                          </p>
                        )}
                        {actionError && (
                          <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            {actionError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-blue-light-100 text-gray-dark-600 rounded-2xl border bg-white/70 p-5 text-sm">
                  <p className="flex items-start gap-2">
                    <Phone className="text-blue-light-500 mt-1 h-4 w-4" />
                    Recuerda mantener una comunicación transparente. Los cambios
                    de estado quedan registrados y se notifican a la parte
                    correspondiente.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
