"use client";

import { useMemo, useState, useEffect } from "react";
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

const STATUS_FILTERS: Array<{ value: "all" | NotificationStatus; label: string }> = [
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
}) => (
	<span
		className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
			isCheckinReminder
				? "border-rose-200 bg-rose-50 text-rose-600"
				: STATUS_STYLES[status]
		}`}
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
		<ol className="flex flex-col gap-2 text-sm text-gray-dark-600">
			{events.map((event) => (
				<li
					key={event.label}
					className="flex items-center justify-between rounded-xl bg-blue-light-50 px-3 py-2"
				>
					<span className="font-medium text-gray-dark-700">{event.label}</span>
					<span>{formatDateTime(event.value)}</span>
				</li>
			))}
		</ol>
	);
};

type DraftNotes = Record<number, string>;

export default function HostNotificationsPage() {
	const {
		notifications,
		loading,
		error,
		refresh,
		updateNotification,
		statusCounts,
	} = useNotifications({ role: "host" });
	const [statusFilter, setStatusFilter] = useState<"all" | NotificationStatus>("all");
	const [searchTerm, setSearchTerm] = useState("");
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
				const haystack = `${notification.propertyTitle} ${notification.hostName ?? ""} ${notification.tenantName ?? ""}`.toLowerCase();
				return haystack.includes(term);
			}
			return true;
		});
	}, [notifications, statusFilter, searchTerm]);

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

	const activeNotification =
		filteredNotifications.find((item) => item.bookingId === activeBooking) ?? null;

	const currentDraftNote = activeBooking ? draftNotes[activeBooking] ?? "" : "";

	const handleDraftChange = (value: string) => {
		if (!activeBooking) {
			return;
		}
		setDraftNotes((prev) => ({ ...prev, [activeBooking]: value }));
	};

	const runAction = async (action: "accept" | "decline") => {
		if (!activeNotification) {
			return;
		}

		setActionMessage(null);
		setActionError(null);
		setActionLoading(true);

		try {
			if (action === "accept") {
				await bookingService.acceptBooking(
					activeNotification.bookingId,
					currentDraftNote
				);
				updateNotification(activeNotification.bookingId, {
					status: "ACCEPTED",
					hostNote: currentDraftNote || activeNotification.hostNote,
					eventAt: new Date().toISOString(),
				});
				setActionMessage("Reserva aprobada correctamente.");
			} else {
				await bookingService.declineBooking(
					activeNotification.bookingId,
					currentDraftNote
				);
				updateNotification(activeNotification.bookingId, {
					status: "DECLINED",
					hostNote: currentDraftNote || activeNotification.hostNote,
					eventAt: new Date().toISOString(),
				});
				setActionMessage("Reserva rechazada.");
			}

			await refresh();
		} catch (err) {
			console.error("Error al ejecutar accion de notificacion (host):", err);
			const message =
				err instanceof Error
					? err.message
					: "Ocurrio un error al procesar la accion";
			setActionError(message);
		} finally {
			setActionLoading(false);
		}
	};

	const canAcceptOrDecline =
		activeNotification?.status === "PENDING" || false;

	return (
		<div className="space-y-6">
			<header className="space-y-2">
				<div className="flex items-center gap-2 text-blue-light-600">
					<Bell className="h-5 w-5" />
					<span className="text-sm font-semibold">
						Gestiona las solicitudes de tus propiedades
					</span>
				</div>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-3xl font-semibold text-gray-dark-900">
							Notificaciones como anfitrión
						</h1>
						<p className="text-gray-dark-600">
							Revisa las solicitudes de reserva, toma decisiones y mantén informados a tus huéspedes.
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						{SUMMARY_ORDER.map((status) => (
							<div
								key={status}
								className="rounded-3xl border border-blue-light-200 bg-blue-light-50 px-4 py-2 text-sm"
							>
								<p className="text-xs font-medium text-gray-dark-500 uppercase">
									{STATUS_LABELS[status]}
								</p>
								<p className="text-lg font-semibold text-gray-dark-800">
									{statusCounts[status] ?? 0}
								</p>
							</div>
						))}
					</div>
				</div>
			</header>

			<section className="border border-blue-light-150 bg-white rounded-3xl p-4 sm:p-6">
				<div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="text-sm font-semibold text-gray-dark-600">
						Vista de anfitrión
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<div className="relative">
							<input
								value={searchTerm}
								onChange={(event) => setSearchTerm(event.target.value)}
								placeholder="Buscar por propiedad o huésped"
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

				<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
					<aside className="rounded-3xl border border-blue-light-150 bg-blue-light-50 p-4">
						<div className="mb-3 flex items-center justify-between">
							<span className="text-sm font-semibold text-gray-dark-700">Listado</span>
							{loading && (
								<Loader2 className="h-4 w-4 animate-spin text-blue-light-500" />
							)}
						</div>
						<div className="flex flex-col gap-2 max-h-[520px] overflow-auto pr-1">
							{filteredNotifications.length === 0 && !loading ? (
								<p className="rounded-2xl border border-dashed border-blue-light-200 bg-white px-4 py-8 text-center text-sm text-gray-dark-500">
									No hay notificaciones para los filtros seleccionados.
								</p>
							) : (
								filteredNotifications.map((notification) => {
									const hasCheckinReminder =
										notification.reminderType === "CHECKIN_24H";
									return (
										<button
											key={`${notification.bookingId}-${notification.role}`}
											type="button"
											onClick={() => setActiveBooking(notification.bookingId)}
											className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
												notification.bookingId === activeBooking
													? "border-blue-vivid-500 bg-white shadow-sm"
												: "border-transparent bg-white/70 hover:border-blue-light-200"
											}`}
										>
											<div className="flex items-center justify-between text-xs text-gray-dark-500">
												<span className="font-semibold text-gray-dark-700">
													#{notification.bookingId}
												</span>
												<div className="flex items-center gap-2">
													<NotificationBadge
														status={notification.status}
														isCheckinReminder={hasCheckinReminder}
													/>
												</div>
											</div>
											<p className="mt-1 text-sm font-semibold text-gray-dark-800 line-clamp-2">
												{notification.propertyTitle}
											</p>
											<p className="text-xs text-gray-dark-500">
												Huésped: {notification.tenantName ?? "Sin datos"}
											</p>
											<p className="mt-1 text-xs text-gray-dark-400">
												Creada {formatDateTime(notification.createdAt)}
											</p>
										</button>
									);
								})
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
										<p className="mt-2">
											Selecciona una notificación para ver los detalles.
										</p>
									</>
								)}
							</div>
						) : (
							<div className="space-y-6">
								<header className="flex flex-col gap-2 border-b border-blue-light-100 pb-4">
									<NotificationBadge
										status={activeNotification.status}
										isCheckinReminder={activeNotification.reminderType === "CHECKIN_24H"}
									/>
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
											Datos del huésped
										</h3>
															<ul className="space-y-2 text-sm text-gray-dark-600">
																<li className="flex items-center gap-2">
																	<CheckCircle2 className="h-4 w-4 text-blue-light-500" />
																	Nombre: {activeNotification.tenantName ?? "Sin datos"}
																</li>
																<li className="flex items-center gap-2">
																	<Mail className="h-4 w-4 text-blue-light-500" />
																	Última actualización: {formatDateTime(activeNotification.eventAt ?? activeNotification.createdAt)}
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

								{activeNotification.reminderType === "CHECKIN_24H" && (
									<div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
										<div className="flex items-start gap-3">
											<Clock className="mt-1 h-5 w-5 text-rose-500" />
											<div className="space-y-1 text-sm text-gray-dark-700">
												<p className="font-semibold text-rose-600">
													Tu huésped llega en menos de 24 horas
												</p>
												<p>
													Verifica que la propiedad esté lista y coordina los detalles de llegada. El check-in está programado para{' '}
													<span className="font-semibold">
														{formatDateTime(activeNotification.checkinDate)}
													</span>
													.
												</p>
											</div>
										</div>
									</div>
								)}

								<div className="grid gap-4 md:grid-cols-2">
									<div className="rounded-2xl border border-blue-light-100 bg-blue-light-50 p-4">
										<h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-dark-700">
											<Clock className="h-4 w-4 text-blue-light-500" />
											Estado de pago
										</h3>
										<p className="text-sm text-gray-dark-600">
											Total reservado:
											<span className="ml-2 font-semibold text-gray-dark-800">
												{formatCurrency(
													activeNotification.totalAmount,
													activeNotification.currencyCode
												)}
											</span>
										</p>
									</div>
									<div className="rounded-2xl border border-blue-light-100 bg-blue-light-50 p-4">
										<h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-dark-700">
											<Clock className="h-4 w-4 text-blue-light-500" />
											Notas y comentarios
										</h3>
										{activeNotification.hostNote && (
											<p className="mb-3 rounded-xl bg-white px-4 py-2 text-sm text-gray-dark-600">
												<span className="font-semibold text-gray-dark-700">
													Nota interna:
												</span>{" "}
												{activeNotification.hostNote}
											</p>
										)}
										{activeNotification.tenantNote && (
											<p className="mb-3 rounded-xl bg-white px-4 py-2 text-sm text-gray-dark-600">
												<span className="font-semibold text-gray-dark-700">
													Mensaje del huésped:
												</span>{" "}
												{activeNotification.tenantNote}
											</p>
										)}

										{canAcceptOrDecline && (
											<div className="space-y-3">
												<label className="block text-sm font-medium text-gray-dark-700">
													Comentario para el huésped (opcional)
													<textarea
														value={currentDraftNote}
														onChange={(event) => handleDraftChange(event.target.value)}
														className="mt-2 w-full rounded-2xl border border-blue-light-200 bg-white px-4 py-3 text-sm text-gray-dark-700 focus:border-blue-light-400 focus:outline-none focus:ring-2 focus:ring-blue-light-200"
														rows={3}
														placeholder="Ej: Confirma tu llegada a las 2 p.m."
													/>
												</label>
												<div className="flex flex-wrap items-center gap-3">
													<button
														type="button"
														onClick={() => runAction("accept")}
														disabled={actionLoading}
														className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
													>
														<CheckCircle2 className="h-4 w-4" /> Aprobar
													</button>
													<button
														type="button"
														onClick={() => runAction("decline")}
														disabled={actionLoading}
														className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
													>
														<XCircle className="h-4 w-4" /> Rechazar
													</button>
													{actionLoading && (
														<Loader2 className="h-4 w-4 animate-spin text-blue-light-500" />
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

								<div className="rounded-2xl border border-blue-light-100 bg-blue-light-50 p-4 text-sm text-gray-dark-600">
									<p className="flex items-start gap-2">
										<Phone className="mt-1 h-4 w-4 text-blue-light-500" />
										Mantén una comunicación clara. Los huéspedes recibirán un correo
										con la decisión que tomes sobre su reserva.
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

