"use client";

import { useEffect, useState, startTransition } from "react";
import { X, Calendar, User, Hash, FileText, Mail, Phone } from "lucide-react";

type GuestRequestModalProps = {
  open: boolean;
  onClose: () => void;
  request: {
    id: string;
    guestName: string;
    requestDate: string;
    roomId: string;
    stayDates: string;
    description: string;
    status?: string;
    contactEmail?: string;
    contactPhone?: string;
  } | null;
};

export default function GuestRequestModal({
  open,
  onClose,
  request,
}: GuestRequestModalProps) {
  const [isVisible, setIsVisible] = useState(false);

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

  const formattedDate = new Date(request.requestDate).toLocaleDateString(
    "es-PE",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 180);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-dark-500/60 backdrop-blur-sm p-4 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-2xl transform rounded-2xl bg-white shadow-2xl transition-all duration-200 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="relative rounded-t-2xl bg-gradient-to-r from-blue-light-500 to-blue-vivid-500 px-8 py-6 text-white">
          <button
            onClick={handleClose}
            className="absolute right-5 top-5 rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-light-100">
              Solicitud de huésped
            </span>
            <h2 className="text-2xl font-bold leading-tight">{request.id}</h2>
            <p className="text-sm text-blue-light-50">
              Recibida el {formattedDate}
            </p>
          </div>
        </header>

        <div className="grid gap-6 px-8 py-8">
          <section className="grid grid-cols-1 gap-4 rounded-xl border border-blue-light-100 bg-blue-light-50/40 p-5 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <User className="h-5 w-5 text-blue-light-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Huésped
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {request.guestName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <Hash className="h-5 w-5 text-blue-light-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Espacio solicitado
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {request.roomId}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <Calendar className="h-5 w-5 text-blue-light-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Estancia estimada
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {request.stayDates}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <FileText className="h-5 w-5 text-blue-light-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Estado actual
                </p>
                <p className="text-base font-semibold text-gray-900 capitalize">
                  {request.status ?? "Sin definir"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Detalle de la solicitud
            </h3>
            <p className="mt-3 text-base leading-relaxed text-gray-700">
              {request.description}
            </p>
          </section>

          <section className="grid gap-4 rounded-xl border border-gray-100 p-6 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-blue-light-100 bg-blue-light-50/60 px-4 py-3">
              <Mail className="h-5 w-5 text-blue-light-600" />
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Email de contacto
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {request.contactEmail ?? "No registrado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-blue-light-100 bg-blue-light-50/60 px-4 py-3">
              <Phone className="h-5 w-5 text-blue-light-600" />
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Teléfono
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {request.contactPhone ?? "No registrado"}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
