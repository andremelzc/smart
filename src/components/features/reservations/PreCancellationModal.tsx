"use client";

import { useState } from "react";
import { AlertTriangle, Info, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

interface PreCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: () => Promise<void>;
  totalAmount: number;
  policyType: "flexible" | "moderate" | "strict"; // Debería venir de la reserva
  checkInDate: string; // Para calcular días restantes
}

export function PreCancellationModal({
  isOpen,
  onClose,
  onConfirmCancel,
  totalAmount,
  policyType,
  checkInDate
}: PreCancellationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    } else { // Strict
       refundPercentage = daysUntilCheckIn > 14 ? 50 : 0;
    }

    return {
      amount: totalAmount * (refundPercentage / 100),
      percentage: refundPercentage
    };
  };

  const refund = calculateRefund();
  const penalty = totalAmount - refund.amount;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await onConfirmCancel();
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-amber-600">
            <div className="bg-amber-100 p-2 rounded-full">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">¿Cancelar reserva?</h2>
          </div>

          <p className="text-gray-600 mb-6">
            Estás sujeto a una política de cancelación <strong className="uppercase">{policyType}</strong>.
          </p>

          {/* Desglose de Reembolso */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6 border border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total pagado</span>
              <span className="font-medium">S/ {totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-red-600">
              <span>Penalidad por cancelación</span>
              <span>- S/ {penalty.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-green-700 pt-3 border-t border-gray-200">
              <span>Tu reembolso estimado</span>
              <span>S/ {refund.amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-gray-500 mb-6 bg-blue-50 p-3 rounded-lg text-blue-700">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>El reembolso se procesará a tu método de pago original en 5-10 días hábiles.</p>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={onClose} disabled={isSubmitting}>
              Mantener reserva
            </Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white" 
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sí, cancelar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}