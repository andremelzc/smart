"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/Button";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  requirePrice?: boolean; // show a price input when true
  initialPrice?: number | null;
  onCancel: () => void;
  onConfirm: (data?: { price?: number | null }) => void;
};

export function ConfirmDialog({
  open,
  title = "Confirmar acción",
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  requirePrice = false,
  initialPrice = null,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const [price, setPrice] = useState<string>(
    initialPrice != null ? String(initialPrice) : ""
  );

  if (!open) return null;

  const handleConfirm = () => {
    if (requirePrice) {
      const parsed = parseFloat(price as string);
      if (Number.isNaN(parsed) || parsed <= 0) {
        // simple client validation
        alert("Ingresa un precio válido mayor a 0");
        return;
      }

      onConfirm({ price: parsed });
      return;
    }

    onConfirm({ price: null });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />

      <div className="relative z-[90] w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        )}

        {requirePrice && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Precio por noche</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
          <Button onClick={handleConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
