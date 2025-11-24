"use client";

import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

interface AcceptReasonModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
  guestName?: string;
  propertyName?: string;
  checkIn?: string;
  checkOut?: string;
  totalAmount?: number;
  isLoading?: boolean;
}

export default function AcceptReasonModal({
  open,
  onClose,
  onConfirm,
  guestName,
  propertyName,
  checkIn,
  checkOut,
  totalAmount,
  isLoading = false,
}: AcceptReasonModalProps) {
  const [note, setNote] = useState("");

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm(note.trim());
  };

  const handleClose = () => {
    if (!isLoading) {
      setNote("");
      onClose();
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "";
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-lg space-y-6 rounded-2xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Aceptar Solicitud
              </h2>
              {guestName && (
                <p className="mt-1 text-sm text-gray-600">
                  Solicitud de {guestName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Estás a punto de aceptar esta solicitud de reserva. El huésped
            recibirá una confirmación y podrá proceder con el pago.
          </p>

          {/* Resumen de la reserva */}
          {(propertyName || checkIn || checkOut || totalAmount) && (
            <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="text-sm font-semibold text-green-900">
                Resumen de la Reserva
              </h3>
              <div className="space-y-1 text-sm text-green-800">
                {propertyName && (
                  <p>
                    <span className="font-medium">Propiedad:</span>{" "}
                    {propertyName}
                  </p>
                )}
                {checkIn && checkOut && (
                  <p>
                    <span className="font-medium">Fechas:</span>{" "}
                    {formatDate(checkIn)} - {formatDate(checkOut)}
                  </p>
                )}
                {totalAmount && (
                  <p className="text-base font-semibold">
                    <span className="font-medium">Total:</span>{" "}
                    {formatCurrency(totalAmount)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Note textarea */}
          <div className="space-y-2">
            <label
              htmlFor="accept-note"
              className="block text-sm font-medium text-gray-700"
            >
              Mensaje para el huésped (opcional)
            </label>
            <textarea
              id="accept-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isLoading}
              placeholder="Escribe un mensaje de bienvenida o instrucciones adicionales para el huésped."
              className="h-32 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed disabled:bg-gray-50"
              maxLength={500}
            />
            <p className="text-right text-xs text-gray-500">
              {note.length}/500 caracteres
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs text-blue-800">
              <strong>Nota importante:</strong> Al aceptar esta solicitud, te
              comprometes a honrar la reserva. El huésped recibirá instrucciones
              para completar el pago y la reserva quedará confirmada.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 bg-green-600 text-white hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <span className="mr-2 inline-block animate-spin">⏳</span>
                Aceptando...
              </>
            ) : (
              "Aceptar Solicitud"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
