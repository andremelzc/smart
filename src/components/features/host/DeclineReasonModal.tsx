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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Rechazar Solicitud
              </h2>
              {guestName && (
                <p className="text-sm text-gray-600 mt-1">
                  Solicitud de {guestName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            ¿Estás seguro de que deseas rechazar esta solicitud de reserva? Esta acción no se puede deshacer.
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
              className="w-full h-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right">
              {reason.length}/500 caracteres
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs text-amber-800">
              <strong>Nota:</strong> Al rechazar esta solicitud, el huésped recibirá una notificación 
              y las fechas quedarán disponibles nuevamente para otras reservas.
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
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
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
