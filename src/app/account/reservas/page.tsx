"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Filter,
  ChevronRight,
  Hotel,
  CheckCircle,
  XCircle,
} from "lucide-react";

type ReservationStatus = "current" | "upcoming" | "past" | "cancelled";

type Reservation = {
  id: string;
  propertyName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: ReservationStatus;
  hostName: string;
  price: string;
  notes?: string;
};

const reservationsMock: Reservation[] = [
  {
    id: "RES-2045",
    propertyName: "Loft moderno en Miraflores",
    location: "Lima, Perú",
    checkIn: "2025-10-24",
    checkOut: "2025-10-28",
    guests: 2,
    status: "current",
    hostName: "Ana Rodríguez",
    price: "S/. 1,320",
    notes: "Check-in autónomo. Código enviado al correo.",
  },
  {
    id: "RES-2076",
    propertyName: "Casa frente al mar en Máncora",
    location: "Talara, Perú",
    checkIn: "2025-12-12",
    checkOut: "2025-12-18",
    guests: 4,
    status: "upcoming",
    hostName: "Luis Flores",
    price: "S/. 2,450",
    notes: "El anfitrión confirmará disponibilidad de tabla de surf.",
  },
  {
    id: "RES-1989",
    propertyName: "Departamento céntrico en Cusco",
    location: "Cusco, Perú",
    checkIn: "2025-09-02",
    checkOut: "2025-09-07",
    guests: 3,
    status: "past",
    hostName: "María Pacheco",
    price: "S/. 980",
    notes: "Recuerda dejar una reseña para ayudar a la comunidad.",
  },
  {
    id: "RES-1904",
    propertyName: "Refugio ecológico en Oxapampa",
    location: "Pasco, Perú",
    checkIn: "2025-08-15",
    checkOut: "2025-08-18",
    guests: 2,
    status: "cancelled",
    hostName: "Diego Vargas",
    price: "S/. 720",
    notes: "Reserva cancelada el 05 de agosto. Reembolso procesado.",
  },
];

const statusStyles: Record<
  ReservationStatus,
  { label: string; badge: string; dot: string }
> = {
  current: {
    label: "En curso",
    badge: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  upcoming: {
    label: "Próxima",
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
    dot: "bg-blue-500",
  },
  past: {
    label: "Finalizada",
    badge: "bg-gray-100 text-gray-700 border border-gray-200",
    dot: "bg-gray-400",
  },
  cancelled: {
    label: "Cancelada",
    badge: "bg-red-100 text-red-700 border border-red-200",
    dot: "bg-red-500",
  },
};

const filterSegments: Array<{ key: "all" | ReservationStatus; label: string }> =
  [
    { key: "all", label: "Todas" },
    { key: "current", label: "En curso" },
    { key: "upcoming", label: "Próximas" },
    { key: "past", label: "Pasadas" },
    { key: "cancelled", label: "Canceladas" },
  ];

const formatRange = (checkIn: string, checkOut: string) => {
  const formatter = new Intl.DateTimeFormat("es-PE", {
    month: "short",
    day: "numeric",
  });

  return `${formatter.format(new Date(checkIn))} - ${formatter.format(
    new Date(checkOut),
  )}`;
};

export default function ReservationsPage() {
  const [selectedFilter, setSelectedFilter] =
    useState<"all" | ReservationStatus>("all");

  const reservations = useMemo(() => {
    if (selectedFilter === "all") {
      return reservationsMock;
    }

    return reservationsMock.filter(
      (reservation) => reservation.status === selectedFilter,
    );
  }, [selectedFilter]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">
          Mis reservas
        </h1>
        <p className="text-gray-600">
          Consulta el estado de tus viajes, encuentra detalles clave y mantén
          todo organizado desde un solo lugar.
        </p>
      </header>

      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-700">
            Filtrar por estado:
          </span>
          <div className="flex flex-wrap gap-2">
            {filterSegments.map((segment) => {
              const isSelected = selectedFilter === segment.key;

              return (
                <button
                  key={segment.key}
                  onClick={() => setSelectedFilter(segment.key)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-blue-light-100 text-blue-light-700 border border-blue-light-300"
                      : "text-gray-600 hover:bg-gray-100 border border-transparent"
                  }`}
                >
                  {segment.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {reservations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <Clock className="h-10 w-10 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">
              No hay reservas bajo este filtro
            </h3>
            <p className="text-sm text-gray-600">
              Cambia el estado seleccionado o realiza una nueva reserva para
              verla aquí.
            </p>
          </div>
        ) : (
          reservations.map((reservation) => {
            const statusInfo = statusStyles[reservation.status];

            return (
              <article
                key={reservation.id}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-1 items-start gap-4">
                    <div className="hidden h-24 w-24 flex-shrink-0 items-center justify-center rounded-xl bg-blue-light-50 text-blue-light-500 lg:flex">
                      <Hotel className="h-10 w-10" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            {reservation.propertyName}
                          </h2>
                          <p className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-blue-light-500" />
                            {reservation.location}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.badge}`}
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${statusInfo.dot}`}
                          />
                          {statusInfo.label}
                        </span>
                      </div>

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
                          Check-in:{" "}
                          {new Date(reservation.checkIn).toLocaleTimeString(
                            "es-PE",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}{" "}
                          / Check-out:{" "}
                          {new Date(reservation.checkOut).toLocaleTimeString(
                            "es-PE",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>

                      <div className="grid gap-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <span>
                            Anfitrión:{" "}
                            <span className="font-medium text-gray-900">
                              {reservation.hostName}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-blue-light-500" />
                          <span>
                            Código de reserva:{" "}
                            <span className="font-medium text-gray-900">
                              {reservation.id}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-blue-light-500" />
                          <span>
                            Total pagado:{" "}
                            <span className="font-semibold text-gray-900">
                              {reservation.price}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="mt-0.5 h-4 w-4 text-blue-light-500" />
                          <span>{reservation.notes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
