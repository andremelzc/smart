"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Info,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";

interface PreCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: () => Promise<void>;
  totalAmount: number;
  policyType: "flexible" | "moderate" | "strict"; // Debería venir de la reserva
  checkInDate: string; // Para calcular días restantes
}

type ModalState = "confirm" | "processing" | "success" | "error";

export function PreCancellationModal({
  isOpen,
  onClose,
  onConfirmCancel,
  totalAmount,
  policyType,
}: PreCancellationModalProps) {
  const [modalState, setModalState] = useState<ModalState>("confirm");
  const [errorMessage, setErrorMessage] = useState<string>("");

  if (!isOpen) return null;

  // Lógica simple de cálculo según PDF
  const calculateRefund = () => {
    // Esto es simplificado. En producción usarías date-fns para la diferencia de días real
    const daysUntilCheckIn = 10; // Simulación: Faltan 10 días

    let refundPercentage = 0;

    if (policyType === "flexible") {
      refundPercentage = daysUntilCheckIn > 1 ? 100 : 0; // Reembolso total hasta 24h antes
    } else if (policyType === "moderate") {
      refundPercentage = daysUntilCheckIn > 5 ? 100 : 50;
    } else {
      // Strict
      refundPercentage = daysUntilCheckIn > 14 ? 50 : 0;
    }

    return {
      amount: totalAmount * (refundPercentage / 100),
      percentage: refundPercentage,
    };
  };

  const handleConfirm = async () => {
    setModalState("processing");
    try {
      await onConfirmCancel();
      setModalState("success");
      // Auto cerrar después de 2 segundos
      setTimeout(() => {
        onClose();
        setModalState("confirm"); // Reset para próxima vez
      }, 2000);
    } catch (error: unknown) {
      setModalState("error");
      const errorMsg =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "error" in error.response.data
          ? String(error.response.data.error)
          : error instanceof Error
            ? error.message
            : "Error desconocido al cancelar";
      setErrorMessage(errorMsg);
    }
  };

  const handleClose = () => {
    if (modalState !== "processing") {
      onClose();
      setModalState("confirm"); // Reset estado
      setErrorMessage("");
    }
  };

  // Estado de éxito
  if (modalState === "success") {
    const refund = calculateRefund();

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="p-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              ¡Reserva cancelada!
            </h2>
            <p className="mb-4 text-gray-600">
              Tu reserva ha sido cancelada exitosamente. El reembolso se
              procesará en 5-10 días hábiles.
            </p>
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-sm text-green-700">
                Reembolso estimado:{" "}
                <strong>S/ {refund.amount.toFixed(2)}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (modalState === "error") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3 text-red-600">
              <div className="rounded-full bg-red-100 p-2">
                <XCircle className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Error al cancelar
              </h2>
            </div>
            <div className="mb-6 rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={handleClose}>
                Cerrar
              </Button>
              <Button
                className="flex-1"
                onClick={() => setModalState("confirm")}
              >
                Intentar de nuevo
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estados de confirmación y procesando
  const refund = calculateRefund();
  const penalty = totalAmount - refund.amount;
  const isProcessing = modalState === "processing";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="p-6">
          <div className="mb-4 flex items-center gap-3 text-amber-600">
            <div className="rounded-full bg-amber-100 p-2">
              {isProcessing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <AlertTriangle className="h-6 w-6" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isProcessing ? "Cancelando reserva..." : "¿Cancelar reserva?"}
            </h2>
          </div>

          {isProcessing ? (
            <div className="py-4 text-center">
              <p className="text-gray-600">Procesando tu cancelación...</p>
            </div>
          ) : (
            <>
              <p className="mb-6 text-gray-600">
                Estás sujeto a una política de cancelación{" "}
                <strong className="uppercase">{policyType}</strong>.
              </p>

              {/* Desglose de Reembolso */}
              <div className="mb-6 space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total pagado</span>
                  <span className="font-medium">
                    S/ {totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-red-600">
                  <span>Penalidad por cancelación</span>
                  <span>- S/ {penalty.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-green-700">
                  <span>Tu reembolso estimado</span>
                  <span>S/ {refund.amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-6 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700 text-gray-500">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>
                  El reembolso se procesará a tu método de pago original en 5-10
                  días hábiles.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={handleClose}
                  disabled={isProcessing}
                >
                  Mantener reserva
                </Button>
                <Button
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  onClick={handleConfirm}
                  disabled={isProcessing}
                >
                  Sí, cancelar
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
