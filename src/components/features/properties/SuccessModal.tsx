"use client";

import { useEffect } from "react";

import { CheckCircle } from "lucide-react";

import { Button } from "@/src/components/ui/Button";

interface SuccessModalProps {
  isOpen: boolean;

  onClose: () => void;

  title?: string;

  message?: string;

  buttonText?: string;
}

export function SuccessModal({
  isOpen,

  onClose,

  title = "Reserva exitosa",

  message = "Tu reserva ha sido confirmada correctamente. Recibiras un correo con los detalles.",

  buttonText = "Entendido",
}: SuccessModalProps) {
  // Bloquear scroll cuando el modal esta abierto

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Manejar tecla Escape

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-gray-900/70 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-2xl">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />

        <h2 className="mb-2 text-2xl font-bold text-gray-900">{title}</h2>

        <p className="mb-6 text-sm text-gray-600">{message}</p>

        <Button className="w-full" size="lg" onClick={onClose}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
