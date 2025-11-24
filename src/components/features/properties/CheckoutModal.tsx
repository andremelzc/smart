"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Star, Home, CreditCard, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { GuestCounts } from "@/src/components/layout/search/GuestPopover";
import { z } from "zod";

// Algoritmo de Luhn para validar números de tarjeta
function validateLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\s/g, "").split("").map(Number);
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// Validar que la tarjeta no esté vencida
function isNotExpired(expiryDate: string): boolean {
  const [month, year] = expiryDate.split("/").map(Number);
  const now = new Date();
  const currentYear = now.getFullYear() % 100; // Últimos 2 dígitos
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

// Schema de validación con Zod
const checkoutFormSchema = z.object({
  cardName: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras y espacios"),

  cardNumber: z
    .string()
    .transform((val) => val.replace(/\s/g, ""))
    .refine((val) => /^\d{16}$/.test(val), "El número de tarjeta debe tener 16 dígitos")
    .refine(validateLuhn, "Número de tarjeta inválido"),

  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Formato inválido (MM/AA)")
    .refine(isNotExpired, "La tarjeta está vencida"),

  cvv: z
    .string()
    .regex(/^\d{3,4}$/, "El CVV debe tener 3 o 4 dígitos"),

  email: z.string().email("Correo electrónico inválido"),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

interface PropertyImage {
  url: string;
  alt?: string;
}

interface CheckoutProperty {
  title: string;

  city: string;

  stateRegion: string;

  country: string;

  images: PropertyImage[];

  reviews: {
    averageRating?: number;

    totalCount?: number;
  };
}

interface CheckoutModalProps {
  isOpen: boolean;

  onClose: () => void;

  onPay: (paymentDetails: CheckoutFormData) => Promise<void> | void;

  property: CheckoutProperty;

  selectedDates: {
    checkIn: string;
    checkOut: string;
    guests: GuestCounts;
  };

  pricing: {
    nightsCount: number;

    totalPrice: number;

    serviceFee: number;

    grandTotal: number;
  };

  currencyFormatter: (value: number) => string;
}

// Componente para mostrar errores de campo
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      {message}
    </p>
  );
}

// Función para formatear número de tarjeta con espacios
function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\s/g, "");
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(" ") : cleaned;
}

// Función para formatear fecha de expiración
function formatExpiryDate(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
  }
  return cleaned;
}

export function CheckoutModal({
  isOpen,
  onClose,
  onPay,
  property,
  selectedDates,
  pricing,
  currencyFormatter,
}: CheckoutModalProps) {
  // Estado del formulario
  const [formData, setFormData] = useState({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Bloquear scroll cuando el modal esta abierto

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Cerrar con tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Cerrar al hacer click en el backdrop
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Formatear fechas para mostrar

  const formatDateLabel = (value: string) => {
    try {
      return new Intl.DateTimeFormat("es-PE", {
        day: "numeric",

        month: "short",

        year: "numeric",
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  const checkInLabel = selectedDates.checkIn
    ? formatDateLabel(selectedDates.checkIn)
    : "";

  const checkOutLabel = selectedDates.checkOut
    ? formatDateLabel(selectedDates.checkOut)
    : "";

  const getGuestSummary = () => {
    const { adults, children, babies, pets } = selectedDates.guests;
    const parts: string[] = [];
    
    if (adults > 0) parts.push(`${adults} adulto${adults !== 1 ? 's' : ''}`);
    if (children > 0) parts.push(`${children} niño${children !== 1 ? 's' : ''}`);
    if (babies > 0) parts.push(`${babies} bebé${babies !== 1 ? 's' : ''}`);
    if (pets > 0) parts.push(`${pets} mascota${pets !== 1 ? 's' : ''}`);
    
    return parts.length > 0 ? parts.join(', ') : '1 adulto';
  };

  const guestsLabel = getGuestSummary();

  const summaryImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : undefined;

  const ratingLabel =
    typeof property.reviews.averageRating === "number"
      ? property.reviews.averageRating.toFixed(1)
      : "0.0";

  // Handlers del formulario
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    let formattedValue = value;

    // Auto-formatear según el campo
    if (field === "cardNumber") {
      const cleaned = value.replace(/\s/g, "");
      if (cleaned.length <= 16 && /^\d*$/.test(cleaned)) {
        formattedValue = formatCardNumber(cleaned);
      } else {
        return; // No permitir más de 16 dígitos
      }
    } else if (field === "expiryDate") {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length <= 4) {
        formattedValue = formatExpiryDate(cleaned);
      } else {
        return;
      }
    } else if (field === "cvv") {
      if (value.length <= 4 && /^\d*$/.test(value)) {
        formattedValue = value;
      } else {
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }));

    // Limpiar error del campo cuando el usuario escribe
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Limpiar error general
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSubmitError(null);

    try {
      // Validar con Zod
      checkoutFormSchema.parse(formData);

      // Si la validación pasa, proceder con el pago
      await onPay(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        // Error general (ej: fallo en el pago)
        setSubmitError(error instanceof Error ? error.message : "Error al procesar el pago");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 px-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-5xl overflow-hidden rounded-4xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-100 z-10"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
          {/* Resumen de la reserva */}

          <section className="flex flex-col gap-6 bg-blue-light-50 p-8">
            <header className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-light-600">
                Resumen de tu reserva
              </p>

              <h2 className="text-2xl font-bold text-gray-900">
                Confirma los detalles
              </h2>
            </header>

            {/* Informacion de la propiedad */}

            <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm">
              {summaryImage?.url ? (
                <Image
                  src={summaryImage.url}
                  alt={summaryImage.alt || property.title}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-light-100 text-lg font-semibold text-blue-light-600">
                  <Home className="h-6 w-6" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold text-gray-900">
                  {property.title}
                </h3>

                <p className="text-sm text-gray-600">
                  {property.city}, {property.stateRegion}, {property.country}
                </p>

                <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

                  <span className="font-semibold">{ratingLabel}</span>

                  <span>({property.reviews.totalCount || 0} resenas)</span>
                </div>
              </div>
            </div>

            {/* Detalles de la reserva */}

            <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Fechas</span>

                <span>
                  {checkInLabel} {checkOutLabel}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Huespedes</span>

                <span>{guestsLabel}</span>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between text-gray-600">
                  <span>
                    {"S/ "}
                    {pricing.totalPrice / pricing.nightsCount} x{" "}
                    {pricing.nightsCount} noche
                    {pricing.nightsCount > 1 ? "s" : ""}
                  </span>

                  <span className="font-medium text-gray-900">
                    {currencyFormatter(pricing.totalPrice)}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-gray-600">
                  <span>Tarifa de servicio</span>

                  <span className="font-medium text-gray-900">
                    {currencyFormatter(pricing.serviceFee)}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
                  <span>Total a pagar</span>

                  <span>{currencyFormatter(pricing.grandTotal)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Formulario de pago */}

          <section className="flex flex-col gap-6 p-8">
            <header className="space-y-2">
              <div className="flex items-center gap-2 text-blue-light-600">
                <CreditCard className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Simulacion de pago
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                Introduce los datos
              </h2>

              <p className="text-sm text-gray-600">
                Esta es una vista previa visual de la pasarela de pago.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre en la tarjeta */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nombre en la tarjeta
                </label>
                <input
                  type="text"
                  value={formData.cardName}
                  onChange={(e) => handleInputChange("cardName", e.target.value)}
                  placeholder="Juan Perez"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${
                    errors.cardName
                      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                  }`}
                />
                <FieldError message={errors.cardName} />
              </div>

              {/* Número de tarjeta */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Numero de tarjeta
                </label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${
                    errors.cardNumber
                      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                  }`}
                />
                <FieldError message={errors.cardNumber} />
              </div>

              {/* Fecha de expiración y CVV */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Fecha de expiracion
                  </label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                    placeholder="MM/AA"
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${
                      errors.expiryDate
                        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                    }`}
                  />
                  <FieldError message={errors.expiryDate} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange("cvv", e.target.value)}
                    placeholder="123"
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${
                      errors.cvv
                        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                    }`}
                  />
                  <FieldError message={errors.cvv} />
                </div>
              </div>

              {/* Correo electrónico */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Correo de confirmacion
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${
                    errors.email
                      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                  }`}
                />
                <FieldError message={errors.email} />
              </div>

              {/* Botón de pago */}
              <div className="space-y-3 pt-2">
                {/* Mensaje de error general */}
                {submitError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>{submitError}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Procesando..."
                    : `Pagar${
                        pricing.grandTotal > 0
                          ? ` ${currencyFormatter(pricing.grandTotal)}`
                          : ""
                      }`}
                </Button>

                <p className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Lock className="h-4 w-4" />
                  Tus datos estan protegidos con cifrado SSL.
                </p>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
