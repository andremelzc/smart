"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

interface DeclineReasonModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  guestName?: string;
  isLoading?: boolean;
}

export default function DeclineReasonModal({
  open,
  onClose,
  onConfirm,
  guestName,
  isLoading = false,
}: DeclineReasonModalProps) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm(reason.trim());
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason("");
      onClose();
    }
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Rechazar Solicitud
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
            ¿Estás seguro de que deseas rechazar esta solicitud de reserva? Esta
            acción no se puede deshacer.
          </p>

          {/* Reason textarea */}
          <div className="space-y-2">
            <label
              htmlFor="decline-reason"
              className="block text-sm font-medium text-gray-700"
            >
              Motivo del rechazo (opcional)
            </label>
            <textarea
              id="decline-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              placeholder="Explica brevemente el motivo del rechazo. Este mensaje será visible para el huésped."
              className="h-32 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:bg-gray-50"
              maxLength={500}
            />
            <p className="text-right text-xs text-gray-500">
              {reason.length}/500 caracteres
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs text-amber-800">
              <strong>Nota:</strong> Al rechazar esta solicitud, el huésped
              recibirá una notificación y las fechas quedarán disponibles
              nuevamente para otras reservas.
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
            className="flex-1 bg-red-600 text-white hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <span className="mr-2 inline-block animate-spin">⏳</span>
                Rechazando...
              </>
            ) : (
              "Rechazar Solicitud"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
