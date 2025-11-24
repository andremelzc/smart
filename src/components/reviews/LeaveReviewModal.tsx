"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Star,
  Loader2,
  AlertCircle,
  MapPin,
  Calendar,
  Home,
  User,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/src/components/ui/Button";

type ReviewRole = "guest" | "host";

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  reviewRole: ReviewRole; // 'guest' (opina sobre propiedad) o 'host' (opina sobre huésped)
  targetName: string; // Nombre de la Propiedad o del Huésped
  targetImage?: string; // URL opcional de la foto (propiedad o avatar)
  location?: string; // Ubicación de la propiedad (ej: "Miraflores, Lima")
  checkInDate?: string; // Fecha de check-in (ej: "15 Ene 2024")
  checkOutDate?: string; // Fecha de check-out (ej: "20 Ene 2024")
}

export function LeaveReviewModal({
  isOpen,
  onClose,
  onSubmit,
  reviewRole,
  targetName,
  targetImage,
  location,
  checkInDate,
  checkOutDate,
}: LeaveReviewModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  // Animación de entrada/salida
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      document.body.style.overflow = "unset";
      // Resetear estado al cerrar
      setTimeout(() => {
        setRating(0);
        setComment("");
        setError(null);
      }, 200);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Por favor selecciona una calificación de estrellas.");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Por favor escribe un comentario de al menos 10 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(rating, comment);
      handleClose();
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al enviar la reseña. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Configuración dinámica de textos según el rol
  const config = {
    guest: {
      title: "¿Cómo estuvo tu estadía?",
      subtitle: "Comparte tu experiencia en",
      placeholder:
        "Cuéntanos qué te gustó, cómo fue la limpieza, la ubicación...",
      iconBg: "bg-blue-vivid-100",
      iconColor: "text-blue-vivid-600",
    },
    host: {
      title: "Califica a tu huésped",
      subtitle: "Tu experiencia hospedando a",
      placeholder:
        "¿Cumplió las reglas de la casa? ¿Dejó el lugar ordenado?...",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  };

  const currentConfig = config[reviewRole];

  // Handler para cerrar modal al hacer click fuera
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className={`bg-gray-dark-900/60 fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-full max-w-lg transform rounded-3xl bg-white shadow-2xl transition-all duration-300 ${
          isVisible ? "translate-y-0 scale-100" : "translate-y-8 scale-95"
        }`}
      >
        {/* Header con gradiente */}
        <div
          className={`from-blue-light-500 to-blue-vivid-600 relative overflow-hidden rounded-t-3xl bg-gradient-to-br px-8 py-6`}
        >
          <button
            onClick={handleClose}
            aria-label="Cerrar modal"
            className="absolute top-4 right-4 cursor-pointer rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="mb-1 text-center text-2xl font-bold text-white">
            {currentConfig.title}
          </h2>
          <p className="text-blue-light-50 text-center text-sm">
            Tu opinión ayuda a la comunidad Smart
          </p>
        </div>

        <div className="p-8">
          {/* Imagen con proporciones 16:9 */}
          <div className="mb-6 aspect-video w-full overflow-hidden rounded-2xl bg-gray-200 shadow-lg">
            {targetImage ? (
              <div className="relative h-full w-full">
                <Image
                  src={targetImage}
                  alt={targetName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Shimmer effect overlay */}
                <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

                {/* Skeleton content */}
                <div className="z-10 flex flex-col items-center space-y-4">
                  {reviewRole === "guest" ? (
                    <Home className="h-20 w-20 text-gray-300" />
                  ) : (
                    <User className="h-20 w-20 text-gray-300" />
                  )}

                  <div className="flex flex-col items-center space-y-2">
                    <div className="h-3 w-32 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-2 w-20 animate-pulse rounded bg-gray-200"></div>
                  </div>

                  <div className="text-xs font-medium tracking-wide text-gray-400 uppercase">
                    {reviewRole === "guest"
                      ? "Sin imagen de propiedad"
                      : "Sin foto de perfil"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info de la propiedad/huésped */}
          <div className="mb-6 text-center">
            <span className="text-sm font-medium tracking-wide text-gray-500 uppercase">
              {currentConfig.subtitle}
            </span>
            <h3 className="text-gray-dark-900 mt-1 mb-3 text-xl font-bold">
              {targetName}
            </h3>

            {/* Ubicación y fechas (solo para guest reviews) */}
            {reviewRole === "guest" &&
              (location || (checkInDate && checkOutDate)) && (
                <div className="flex flex-col items-center gap-2">
                  {location && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">{location}</span>
                    </div>
                  )}

                  {checkInDate && checkOutDate && (
                    <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">
                        {checkInDate} - {checkOutDate}
                      </span>
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Estrellas Interactivas */}
          <div className="mb-8 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`Calificar con ${star} estrellas`}
                className="cursor-pointer transition-transform hover:scale-110 focus:outline-none active:scale-95"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`h-10 w-10 transition-colors duration-200 ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-100 text-gray-300"
                  }`}
                  strokeWidth={star <= (hoverRating || rating) ? 0 : 1.5}
                />
              </button>
            ))}
          </div>

          {/* Texto de calificación (Feedback visual) */}
          <div className="-mt-4 mb-6 h-6 text-center">
            {(hoverRating || rating) > 0 && (
              <span
                className={`rounded-full px-3 py-1 text-sm font-bold ${
                  (hoverRating || rating) >= 4
                    ? "bg-green-100 text-green-700"
                    : (hoverRating || rating) === 3
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {
                  ["Muy malo", "Malo", "Regular", "Bueno", "¡Excelente!"][
                    (hoverRating || rating) - 1
                  ]
                }
              </span>
            )}
          </div>

          {/* Textarea */}
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (error) setError(null);
                }}
                rows={4}
                className={`text-gray-dark-700 w-full resize-none rounded-2xl border p-4 transition-all placeholder:text-gray-400 focus:ring-2 focus:outline-none ${
                  error
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "focus:border-blue-light-500 focus:ring-blue-light-100 border-gray-200 bg-gray-50 focus:bg-white"
                }`}
                placeholder={currentConfig.placeholder}
              />
              <div className="mt-2 text-right">
                <span
                  className={`text-xs ${
                    comment.length < 10
                      ? "text-gray-400"
                      : "font-medium text-green-600"
                  }`}
                >
                  {comment.length} caracteres
                  {comment.length < 10 && ` (mínimo 10)`}
                </span>
              </div>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="animate-shake flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="mt-8 flex gap-3">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="flex-1 cursor-pointer"
              disabled={isSubmitting}
            >
              Quizás luego
            </Button>
            <Button
              onClick={handleSubmit}
              className={`from-blue-light-500 to-blue-vivid-600 hover:from-blue-light-600 hover:to-blue-vivid-700 flex-1 cursor-pointer bg-gradient-to-r text-white shadow-lg shadow-blue-500/25`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </div>
              ) : (
                "Enviar Reseña"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
