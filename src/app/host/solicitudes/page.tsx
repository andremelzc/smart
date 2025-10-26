"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import GuestRequestModal from "@/src/components/features/host/GuestRequestModal";

type DummyRequest = {
  id: string;
  guestName: string;
  requestDate: string;
  roomId: string;
  stayDates: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  contactEmail?: string;
  contactPhone?: string;
};

const dummyRequests: DummyRequest[] = [
  {
    id: "REQ-98231",
    guestName: "María López",
    requestDate: "2025-10-24T17:30:00Z",
    roomId: "ROOM-13B",
    stayDates: "15 - 18 de noviembre de 2025",
    description:
      "María viaja por trabajo y busca un espacio tranquilo con buen acceso a internet para realizar videollamadas.",
    status: "pending",
    contactEmail: "maria.lopez@example.com",
    contactPhone: "+51 987 654 321",
  },
  {
    id: "REQ-98232",
    guestName: "Carlos Fernández",
    requestDate: "2025-10-22T09:45:00Z",
    roomId: "ROOM-07A",
    stayDates: "2 - 5 de diciembre de 2025",
    description:
      "Carlos desea celebrar un aniversario familiar y necesita confirmación sobre disponibilidad de estacionamiento.",
    status: "approved",
    contactEmail: "carlos.fernandez@example.com",
    contactPhone: "+51 965 432 198",
  },
];

export default function HostRequestsPage() {
  const [selectedRequest, setSelectedRequest] = useState<DummyRequest | null>(
    null,
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            Solicitudes recientes
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Aquí puedes revisar las solicitudes que recibes de huéspedes
            interesados en tus espacios. Selecciona “Detalle” para ver más
            información antes de aceptar o rechazar.
          </p>
        </header>

        <section className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="divide-y divide-gray-100">
            {dummyRequests.map((request) => {
              const isSelected = selectedRequest?.id === request.id;

              return (
                <article
                  key={request.id}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-base font-semibold text-gray-900">
                        {request.guestName}
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {request.roomId}
                      </span>
                      <span className="text-xs uppercase tracking-wide text-gray-500">
                        {request.status === "pending" && "Pendiente"}
                        {request.status === "approved" && "Aprobada"}
                        {request.status === "rejected" && "Rechazada"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {request.description}
                    </p>
                    <dl className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <dt className="font-medium text-gray-700">
                          Fecha de solicitud:
                        </dt>
                        <dd>
                          {new Date(request.requestDate).toLocaleDateString(
                            "es-PE",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <dt className="font-medium text-gray-700">
                          Estancia estimada:
                        </dt>
                        <dd>{request.stayDates}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="primary"
                      onClick={() =>
                        setSelectedRequest(isSelected ? null : request)
                      }
                    >
                      {isSelected ? "Cerrar" : "Detalle"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <GuestRequestModal
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
      />
    </div>
  );
}
