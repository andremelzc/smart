'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  UserRound,
  XCircle,
} from 'lucide-react';
import { useNotifications } from '@/src/hooks/useNotifications';
import type { NotificationItem, NotificationRole, NotificationStatus } from '@/src/types/dtos/notifications.dto';
import { bookingService } from '@/src/services/booking.service';

const STATUS_LABELS: Record<NotificationStatus, string> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptada',
  DECLINED: 'Rechazada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
};

const STATUS_STYLES: Record<NotificationStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ACCEPTED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  DECLINED: 'bg-red-100 text-red-700 border-red-200',
  CANCELLED: 'bg-rose-100 text-rose-700 border-rose-200',
  COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200',
};

const ROLE_LABELS: Record<NotificationRole, string> = {
  host: 'Anfitrión',
  tenant: 'Huésped',
};

const STATUS_FILTERS: Array<{ value: 'all' | NotificationStatus; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'ACCEPTED', label: 'Aceptadas' },
  { value: 'DECLINED', label: 'Rechazadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
  { value: 'COMPLETED', label: 'Completadas' },
];

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return '—';
  }
  try {
    return new Date(value).toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
};

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency || 'PEN',
    }).format(amount);
  } catch {
    return `S/ ${amount.toFixed(2)}`;
  }
};

const NotificationBadge = ({ status }: { status: NotificationStatus }) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
  >
    {STATUS_LABELS[status]}
  </span>
);

const NotificationTimeline = ({
  notification,
}: {
  notification: NotificationItem;
}) => {
  const events: Array<{ label: string; value: string | null }> = [
    { label: 'Creada', value: notification.createdAt },
  ];

  if (notification.status === 'ACCEPTED') {
    events.push({ label: 'Aprobada', value: notification.eventAt ?? notification.createdAt });
  }

  if (notification.status === 'DECLINED') {
    events.push({ label: 'Rechazada', value: notification.eventAt ?? notification.createdAt });
  }

  if (notification.status === 'CANCELLED') {
    events.push({ label: 'Cancelada', value: notification.eventAt ?? notification.createdAt });
  }

  if (notification.status === 'COMPLETED') {
    events.push({ label: 'Completada', value: notification.eventAt ?? notification.createdAt });
  }

  return (
    <ol className="flex flex-col gap-2 text-sm text-gray-dark-600">
      {events.map((event) => (
        <li key={event.label} className="flex items-center justify-between rounded-xl bg-blue-light-50 px-3 py-2">
          <span className="font-medium text-gray-dark-700">{event.label}</span>
          <span>{formatDateTime(event.value)}</span>
        </li>
      ))}
    </ol>
  );
};

type DraftNotes = Record<number, string>;

export default function NotificationsPage() {
  const { notifications, loading, error, refresh, updateNotification, availableRoles } = useNotifications();
  const [selectedRole, setSelectedRole] = useState<NotificationRole | 'all'>('host');
  const [statusFilter, setStatusFilter] = useState<'all' | NotificationStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeBooking, setActiveBooking] = useState<number | null>(null);
  const [draftNotes, setDraftNotes] = useState<DraftNotes>({});
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const roleOptions = useMemo<NotificationRole[]>(
    () => (availableRoles.length > 0 ? availableRoles : ['host', 'tenant']),
    [availableRoles]
  );

  useEffect(() => {
    if (selectedRole === 'all' || !roleOptions.includes(selectedRole)) {
      setSelectedRole(roleOptions[0]);
    }
  }, [roleOptions, selectedRole]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (selectedRole !== 'all' && notification.role !== selectedRole) {
        return false;
      }
      if (statusFilter !== 'all' && notification.status !== statusFilter) {
        return false;
      }
      if (searchTerm.trim().length > 0) {
        const term = searchTerm.trim().toLowerCase();
        const haystack = `${notification.propertyTitle} ${notification.hostName ?? ''} ${notification.tenantName ?? ''}`.toLowerCase();
        return haystack.includes(term);
      }
      return true;
    });
  }, [notifications, selectedRole, statusFilter, searchTerm]);

  useEffect(() => {
    if (filteredNotifications.length === 0) {
      setActiveBooking(null);
      return;
    }
    setActiveBooking((prev) => {
      if (prev && filteredNotifications.some((item) => item.bookingId === prev)) {
        return prev;
      }
      return filteredNotifications[0]?.bookingId ?? null;
    });
  }, [filteredNotifications]);

  const activeNotification = filteredNotifications.find((item) => item.bookingId === activeBooking) ?? null;

  const currentDraftNote = activeBooking ? draftNotes[activeBooking] ?? '' : '';

  const handleDraftChange = (value: string) => {
    if (!activeBooking) {
      return;
    }
    setDraftNotes((prev) => ({ ...prev, [activeBooking]: value }));
  };

  const runAction = async (action: 'accept' | 'decline' | 'cancel') => {
    if (!activeNotification) {
      return;
    }

    setActionMessage(null);
    setActionError(null);
    setActionLoading(true);

    try {
      if (action === 'accept') {
        await bookingService.acceptBooking(activeNotification.bookingId, currentDraftNote);
        updateNotification(activeNotification.bookingId, {
          status: 'ACCEPTED',
          hostNote: currentDraftNote || activeNotification.hostNote,
          eventAt: new Date().toISOString(),
        });
        setActionMessage('Reserva aprobada correctamente.');
      } else if (action === 'decline') {
        await bookingService.declineBooking(activeNotification.bookingId, currentDraftNote);
        updateNotification(activeNotification.bookingId, {
          status: 'DECLINED',
          hostNote: currentDraftNote || activeNotification.hostNote,
          eventAt: new Date().toISOString(),
        });
        setActionMessage('Reserva rechazada.');
      } else {
        await bookingService.cancelBookingAsTenant(activeNotification.bookingId, currentDraftNote);
        updateNotification(activeNotification.bookingId, {
          status: 'CANCELLED',
          tenantNote: currentDraftNote || activeNotification.tenantNote,
          eventAt: new Date().toISOString(),
        });
        setActionMessage('Reserva cancelada con exito.');
      }
      await refresh();
    } catch (err) {
      console.error('Error al ejecutar accion de notificacion:', err);
      const message = err instanceof Error ? err.message : 'Ocurrio un error al procesar la accion';
      setActionError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const canAcceptOrDecline = activeNotification?.role === 'host' && activeNotification.status === 'PENDING';
  const canCancel = activeNotification?.role === 'tenant' && activeNotification.status === 'ACCEPTED';

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-blue-light-600">
          <Bell className="h-5 w-5" />
          <span className="text-sm font-semibold">Gestiona tus notificaciones de reservas</span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-gray-dark-900">Notificaciones</h1>
            <p className="text-gray-dark-600">
              Revisa las solicitudes pendientes, actualizaciones de estado y acciones requeridas en tus reservas.
            </p>
          </div>
        </div>
      </header>

      <section className="border border-blue-light-150 bg-white rounded-3xl p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {roleOptions.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  selectedRole === role
                    ? 'border-blue-vivid-500 bg-blue-vivid-50 text-blue-vivid-700'
                    : 'border-blue-light-200 text-gray-dark-600 hover:border-blue-light-300'
                }`}
                type="button"
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por propiedad o nombre"
                className="rounded-full border border-blue-light-200 bg-blue-light-50 px-4 py-2 text-sm text-gray-dark-700 focus:border-blue-light-400 focus:outline-none focus:ring-2 focus:ring-blue-light-200"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-dark-400">
                <MessageSquare className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-center gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    statusFilter === filter.value
                      ? 'border-blue-vivid-500 bg-blue-vivid-50 text-blue-vivid-700'
                      : 'border-blue-light-200 text-gray-dark-500 hover:border-blue-light-300'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
          <aside className="rounded-3xl border border-blue-light-150 bg-blue-light-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-dark-700">Listado</span>
              {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-light-500" />}
            </div>
            <div className="flex flex-col gap-2 max-h-[520px] overflow-auto pr-1">
              {filteredNotifications.length === 0 && !loading ? (
                <p className="rounded-2xl border border-dashed border-blue-light-200 bg-white px-4 py-8 text-center text-sm text-gray-dark-500">
                  No hay notificaciones para los filtros seleccionados.
                </p>
              ) : (
                filteredNotifications.map((notification) => (
                  <button
                    key={`${notification.bookingId}-${notification.role}`}
                    type="button"
                    onClick={() => setActiveBooking(notification.bookingId)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      notification.bookingId === activeBooking
                        ? 'border-blue-vivid-500 bg-white shadow-sm'
                        : 'border-transparent bg-white/70 hover:border-blue-light-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-gray-dark-500">
                      <span className="font-semibold text-gray-dark-700">#{notification.bookingId}</span>
                      <NotificationBadge status={notification.status} />
                    </div>
                    <p className="mt-1 text-sm font-semibold text-gray-dark-800 line-clamp-2">
                      {notification.propertyTitle}
                    </p>
                    <p className="text-xs text-gray-dark-500">
                      {notification.role === 'host'
                        ? `Huésped: ${notification.tenantName ?? 'Sin datos'}`
                        : `Anfitrión: ${notification.hostName ?? 'Sin datos'}`}
                    </p>
                    <p className="mt-1 text-xs text-gray-dark-400">
                      Creada {formatDateTime(notification.createdAt)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="rounded-3xl border border-blue-light-150 bg-white p-6">
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {!activeNotification ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-gray-dark-500">
                {loading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-blue-light-500" />
                    <p className="mt-2">Cargando notificaciones...</p>
                  </>
                ) : (
                  <>
                    <Bell className="h-8 w-8 text-blue-light-300" />
                    <p className="mt-2">Selecciona una notificación para ver los detalles.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <header className="flex flex-col gap-2 border-b border-blue-light-100 pb-4">
                  <div className="flex items-center gap-3">
                    <NotificationBadge status={activeNotification.status} />
                    <span className="rounded-full bg-blue-light-50 px-3 py-1 text-xs font-semibold text-blue-light-600">
                      Rol: {ROLE_LABELS[activeNotification.role]}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-dark-900">
                    {activeNotification.propertyTitle}
                  </h2>
                  <p className="text-sm text-gray-dark-500">
                    Check-in {formatDateTime(activeNotification.checkinDate)} • Check-out {formatDateTime(activeNotification.checkoutDate)}
                  </p>
                </header>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-blue-light-100 bg-blue-light-50 p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-dark-700">
                      <UserRound className="h-4 w-4 text-blue-light-500" />
                      Involucrados
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-dark-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-light-500" />
                        Anfitrión: {activeNotification.hostName ?? 'Sin datos'}
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-light-500" />
                        Huésped: {activeNotification.tenantName ?? 'Sin datos'}
                      </li>
                      <li className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-light-500" />
                        Total: {formatCurrency(activeNotification.totalAmount, activeNotification.currencyCode)}
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-blue-light-100 bg-blue-light-50 p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-dark-700">
                      <Calendar className="h-4 w-4 text-blue-light-500" />
                      Linea de tiempo
                    </h3>
                    <NotificationTimeline notification={activeNotification} />
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-light-100 bg-blue-light-50 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-dark-700">
                    <Clock className="h-4 w-4 text-blue-light-500" />
                    Notas y comentarios
                  </h3>
                  {activeNotification.hostNote && (
                    <p className="mb-3 rounded-xl bg-white px-4 py-2 text-sm text-gray-dark-600">
                      <span className="font-semibold text-gray-dark-700">Nota del anfitrión:</span>{' '}
                      {activeNotification.hostNote}
                    </p>
                  )}
                  {activeNotification.tenantNote && (
                    <p className="mb-3 rounded-xl bg-white px-4 py-2 text-sm text-gray-dark-600">
                      <span className="font-semibold text-gray-dark-700">Motivo del huésped:</span>{' '}
                      {activeNotification.tenantNote}
                    </p>
                  )}

                  {(canAcceptOrDecline || canCancel) && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-dark-700">
                        {canAcceptOrDecline ? 'Comentario para el huésped (opcional)' : 'Motivo de la cancelación (opcional)'}
                        <textarea
                          value={currentDraftNote}
                          onChange={(event) => handleDraftChange(event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-blue-light-200 bg-white px-4 py-3 text-sm text-gray-dark-700 focus:border-blue-light-400 focus:outline-none focus:ring-2 focus:ring-blue-light-200"
                          rows={3}
                          placeholder={canAcceptOrDecline ? 'Ej: Confirma tu llegada a las 2 p.m.' : 'Explica por qué necesitas cancelar'}
                        />
                      </label>
                      <div className="flex flex-wrap items-center gap-3">
                        {canAcceptOrDecline && (
                          <>
                            <button
                              type="button"
                              onClick={() => runAction('accept')}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <CheckCircle2 className="h-4 w-4" /> Aprobar
                            </button>
                            <button
                              type="button"
                              onClick={() => runAction('decline')}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <XCircle className="h-4 w-4" /> Rechazar
                            </button>
                          </>
                        )}
                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => runAction('cancel')}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <XCircle className="h-4 w-4" /> Cancelar reserva
                          </button>
                        )}
                        {actionLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-light-500" />}
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

                <div className="rounded-2xl border border-blue-light-100 bg-blue-light-50 p-4 text-sm text-gray-dark-600">
                  <p className="flex items-start gap-2">
                    <Phone className="mt-1 h-4 w-4 text-blue-light-500" />
                    Recuerda mantener una comunicación transparente. Los cambios de estado quedan registrados y se notifican a la parte correspondiente.
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
