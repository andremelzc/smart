"use client";

import { useState, useEffect } from "react";
import {
  X,
  Star,
  Loader2,
  MessageSquare,
  AlertCircle,
  MapPin,
  Calendar,
} from "lucide-react";
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

  if (!isOpen) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

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

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gray-dark-900/60 backdrop-blur-sm p-4 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`relative w-full max-w-lg transform rounded-3xl bg-white shadow-2xl transition-all duration-300 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
        }`}
      >
        {/* Header con gradiente */}
        <div
          className={`relative px-8 py-6 bg-gradient-to-br rounded-t-3xl overflow-hidden from-blue-light-500 to-blue-vivid-600`}
        >
          <button
            onClick={handleClose}
            aria-label="Cerrar modal"
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold text-white text-center mb-1">
            {currentConfig.title}
          </h2>
          <p className="text-blue-light-50 text-center text-sm">
            Tu opinión ayuda a la comunidad Smart
          </p>
        </div>

        <div className="p-8">
          {/* Imagen con proporciones 16:9 */}
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg mb-6 bg-gray-200">
            {targetImage ? (
              <img
                src={targetImage}
                alt={targetName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center ${currentConfig.iconBg}`}
              >
                <MessageSquare
                  className={`w-12 h-12 ${currentConfig.iconColor}`}
                />
              </div>
            )}
          </div>

          {/* Info de la propiedad/huésped */}
          <div className="text-center mb-6">
            <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">
              {currentConfig.subtitle}
            </span>
            <h3 className="text-xl font-bold text-gray-dark-900 mt-1 mb-3">
              {targetName}
            </h3>

            {/* Ubicación y fechas (solo para guest reviews) */}
            {reviewRole === "guest" &&
              (location || (checkInDate && checkOutDate)) && (
                <div className="flex flex-col gap-2 items-center">
                  {location && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">{location}</span>
                    </div>
                  )}

                  {checkInDate && checkOutDate && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">
                        {checkInDate} - {checkOutDate}
                      </span>
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Estrellas Interactivas */}
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`Calificar con ${star} estrellas`}
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-10 h-10 transition-colors duration-200 ${
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
          <div className="text-center h-6 mb-6 -mt-4">
            {(hoverRating || rating) > 0 && (
              <span
                className={`text-sm font-bold px-3 py-1 rounded-full ${
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
                className={`w-full rounded-2xl border p-4 text-gray-dark-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${
                  error
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:border-blue-light-500 focus:ring-blue-light-100 bg-gray-50 focus:bg-white"
                }`}
                placeholder={currentConfig.placeholder}
              />
              <div className="mt-2 text-right">
                <span
                  className={`text-xs ${
                    comment.length < 10
                      ? "text-gray-400"
                      : "text-green-600 font-medium"
                  }`}
                >
                  {comment.length} caracteres
                  {comment.length < 10 && ` (mínimo 10)`}
                </span>
              </div>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 mt-8">
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
              className={`flex-1 text-white shadow-lg cursor-pointer shadow-blue-500/25 bg-gradient-to-r from-blue-light-500 to-blue-vivid-600 hover:from-blue-light-600 hover:to-blue-vivid-700`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
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
