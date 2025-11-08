"use client";

import { useMemo, useState } from "react";
import {
  HostReservationCard,
  ReservationFilters,
  ReservationEmptyState,
  type HostReservation,
  type FilterSegment,
} from "@/src/components/features/reservations";
import GuestRequestModal from "@/src/components/features/host/GuestRequestModal";

type HostReservationStatus = "pending" | "accepted" | "confirmed" | "cancelled";
type TimeFilter = "present" | "upcoming" | "past" | "all";

type LocalHostReservation = {
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

const reservationsMock: LocalHostReservation[] = [
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

const statusSegments: FilterSegment<"all" | HostReservationStatus>[] = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendientes" },
  { key: "accepted", label: "Aceptadas" },
  { key: "confirmed", label: "Confirmadas" },
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
        open={Boolean(selectedReservation)}
        request={selectedReservation}
        onClose={() => setSelectedReservationId(null)}
      />
    </div>
  );
}
