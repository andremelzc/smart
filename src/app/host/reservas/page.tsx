"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Filter,
  ChevronRight,
  Hourglass,
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import GuestRequestModal from "@/src/components/features/host/GuestRequestModal";

type HostReservationStatus = "pending" | "accepted" | "confirmed" | "cancelled";
type TimeFilter = "present" | "upcoming" | "past" | "all";

type HostReservation = {
  id: string;
  guestName: string;
  propertyName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: HostReservationStatus;
  total: string;
  roomId: string;
  requestDescription: string;
  contactEmail: string;
  contactPhone: string;
};

const reservationsMock: HostReservation[] = [
  {
    id: "SOL-1048",
    guestName: "Natalia Gamarra",
    propertyName: "Estudio creativo en Barranco",
    location: "Lima, Peru",
    checkIn: "2025-10-25T15:00:00Z",
    checkOut: "2025-10-27T12:00:00Z",
    guests: 2,
    status: "pending",
    total: "S/. 540",
    roomId: "ROOM-08C",
    requestDescription:
      "Natalia produce un workshop de fotografia y necesita un ambiente iluminado con acceso a proyector.",
    contactEmail: "natalia.gamarra@example.com",
    contactPhone: "+51 987 111 222",
  },
  {
    id: "RES-2051",
    guestName: "Sergio Paredes",
    propertyName: "Casa familiar con terraza",
    location: "Arequipa, Peru",
    checkIn: "2025-11-05T14:00:00Z",
    checkOut: "2025-11-09T11:00:00Z",
    guests: 4,
    status: "confirmed",
    total: "S/. 1,350",
    roomId: "ROOM-10B",
    requestDescription:
      "Reserva confirmada para un viaje familiar. Solicitan recomendaciones gastronomicas cercanas.",
    contactEmail: "sergio.paredes@example.com",
    contactPhone: "+51 944 555 111",
  },
  {
    id: "RES-2022",
    guestName: "Camila Huaman",
    propertyName: "Loft urbano minimalista",
    location: "Cusco, Peru",
    checkIn: "2025-09-18T15:00:00Z",
    checkOut: "2025-09-22T11:00:00Z",
    guests: 1,
    status: "accepted",
    total: "S/. 720",
    roomId: "ROOM-04A",
    requestDescription:
      "Solicitud aceptada. Camila participara en un congreso y pidio silla ergonomica para teletrabajo.",
    contactEmail: "camila.huaman@example.com",
    contactPhone: "+51 913 222 654",
  },
  {
    id: "RES-1980",
    guestName: "Daniel Vega",
    propertyName: "Cabana ecologica",
    location: "Oxapampa, Peru",
    checkIn: "2025-08-01T13:00:00Z",
    checkOut: "2025-08-04T12:00:00Z",
    guests: 3,
    status: "cancelled",
    total: "S/. 890",
    roomId: "ROOM-02F",
    requestDescription:
      "Reserva cancelada por el huesped. Se aplico politica flexible con reembolso del 80%.",
    contactEmail: "daniel.vega@example.com",
    contactPhone: "+51 955 888 300",
  },
];

const statusConfig: Record<
  HostReservationStatus,
  { label: string; badge: string }
> = {
  pending: {
    label: "Pendiente",
    badge: "bg-yellow-50 text-yellow-800 border border-yellow-200",
  },
  accepted: {
    label: "Aceptada",
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  confirmed: {
    label: "Confirmada",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  cancelled: {
    label: "Cancelada",
    badge: "bg-red-50 text-red-700 border border-red-200",
  },
};

const statusSegments: Array<
  { key: "all" | HostReservationStatus; label: string }
> = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendientes" },
  { key: "accepted", label: "Aceptadas" },
  { key: "confirmed", label: "Confirmadas" },
  { key: "cancelled", label: "Canceladas" },
];

const timeSegments: Array<{ key: TimeFilter; label: string }> = [
  { key: "present", label: "Presentes" },
  { key: "upcoming", label: "Proximas" },
  { key: "past", label: "Pasadas" },
  { key: "all", label: "Todas" },
];

const normalizeDate = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const formatRange = (checkIn: string, checkOut: string) => {
  const formatter = new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "short",
  });

  return `${formatter.format(new Date(checkIn))} - ${formatter.format(
    new Date(checkOut),
  )}`;
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

  const today = normalizeDate(new Date());

  const sampleUpcomingReservation = reservationsMock.find(
    (reservation) => normalizeDate(reservation.checkIn) > today,
  );

  const upcomingExampleText = sampleUpcomingReservation
    ? `Ejemplo: usa el filtro "Proximas" para ver reservas como "${sampleUpcomingReservation.propertyName}" con check-in el ${formatDay(
        sampleUpcomingReservation.checkIn,
      )}.`
    : 'Ejemplo: usa el filtro "Proximas" para mostrar reservas con check-in posterior a hoy.';

  const filteredReservations = useMemo(() => {
    return reservationsMock.filter((reservation) => {
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
  }, [statusFilter, timeFilter, today]);

  const selectedReservation = useMemo(() => {
    if (!selectedReservationId) return null;
    const reservation = reservationsMock.find(
      (item) => item.id === selectedReservationId,
    );
    if (!reservation) return null;

    return {
      id: reservation.id,
      guestName: reservation.guestName,
      requestDate: reservation.checkIn,
      roomId: reservation.roomId,
      stayDates: formatRange(reservation.checkIn, reservation.checkOut),
      description: reservation.requestDescription,
      status: statusConfig[reservation.status].label,
      contactEmail: reservation.contactEmail,
      contactPhone: reservation.contactPhone,
    };
  }, [selectedReservationId]);

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

        <section className="rounded-xl border border-gray-100 bg-white p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
            <Filter className="h-4 w-4 text-gray-500" />
            Configura la vista
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex-1 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Estado de la reserva
              </p>
              <div className="flex flex-wrap gap-2">
                {statusSegments.map((segment) => {
                  const isActive = statusFilter === segment.key;
                  return (
                    <button
                      key={segment.key}
                      onClick={() => setStatusFilter(segment.key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-blue-light-100 text-blue-light-700 border border-blue-light-300"
                          : "text-gray-600 border border-transparent hover:bg-gray-100"
                      }`}
                    >
                      {segment.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-gray-100 md:border-t-0 md:border-l md:border-gray-100 md:h-20" />

            <div className="flex-1 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Relevancia temporal
              </p>
              <div className="flex flex-wrap gap-2">
                {timeSegments.map((segment) => {
                  const isActive = timeFilter === segment.key;
                  return (
                    <button
                      key={segment.key}
                      onClick={() => setTimeFilter(segment.key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-blue-light-100 text-blue-light-700 border border-blue-light-300"
                          : "text-gray-600 border border-transparent hover:bg-gray-100"
                      }`}
                    >
                      {segment.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500">{upcomingExampleText}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {filteredReservations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
              <Hourglass className="mx-auto mb-4 h-10 w-10 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">
                No hay reservas bajo este criterio
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Ajusta los filtros para explorar otras ventanas de tiempo o
                estados.
              </p>
            </div>
          ) : (
            filteredReservations.map((reservation) => {
              const statusInfo = statusConfig[reservation.status];
              const isSelected = selectedReservationId === reservation.id;

              return (
                <article
                  key={reservation.id}
                  className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">
                          {reservation.propertyName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {reservation.roomId}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusInfo.badge}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-blue-light-500" />
                        {reservation.location}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {formatRange(
                            reservation.checkIn,
                            reservation.checkOut,
                          )}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          {reservation.guests}{" "}
                          {reservation.guests === 1 ? "huesped" : "huespedes"}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          Entrada {formatDay(reservation.checkIn)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-2 text-right">
                      <span className="text-sm text-gray-500">Total</span>
                      <p className="text-xl font-semibold text-gray-900">
                        {reservation.total}
                      </p>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setSelectedReservationId(isSelected ? null : reservation.id)
                        }
                        className="mt-2 text-blue-light-600 hover:text-blue-light-700"
                      >
                        {isSelected ? "Cerrar" : "Ver detalle"}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>

      <GuestRequestModal
        open={Boolean(selectedReservation)}
        request={selectedReservation}
        onClose={() => setSelectedReservationId(null)}
      />
    </div>
  );
}
