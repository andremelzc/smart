"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LeaveReviewModal } from "./LeaveReviewModal";
import { useAuth } from "@/src/hooks/useAuth";

// Definir tipo para la reserva pendiente
type PendingReview = {
  bookingId: string;
  targetName: string;
  targetImage?: string;
  role: "guest" | "host"; // 'guest' = yo soy huesped, 'host' = yo soy anfitrion
  location?: string;
  checkInDate?: string;
  checkOutDate?: string;
};

export function ReviewNudge() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingReview, setPendingReview] = useState<PendingReview | null>(
    null
  );

  useEffect(() => {
    // Lógica: Solo ejecutar si el usuario está autenticado y en página relevante
    const isHostContext = pathname.startsWith("/host");
    const isTenantContext =
      pathname === "/" ||
      pathname.startsWith("/account") ||
      pathname.startsWith("/properties");

    const shouldShowReviews = isHostContext || isTenantContext;

    if (isAuthenticated && shouldShowReviews && !isOpen) {
      checkPendingReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, pathname]);

  const checkPendingReviews = async () => {
    try {
      // --- SIMULACIÓN PARA PROTOTIPO ---
      // 1. Probabilidad de que aparezca una reseña pendiente
      const hasPendingReview = Math.random() > 0.3; // 70% probabilidad

      if (!hasPendingReview) return;

      // 2. Determinar el role según el contexto actual (pathname)
      // Solo mostrar en rutas específicas exactas
      const isHostContext = pathname === "/host";
      const isTenantContext = pathname === "/";

      // Si no estamos en ninguna de las rutas permitidas, no mostrar
      if (!isHostContext && !isTenantContext) return;

      let mockPending: PendingReview;

      if (isHostContext) {
        // CASO A: Estoy en contexto HOST -> calificar a un HUÉSPED
        mockPending = {
          bookingId: "RES-H999",
          role: "host",
          targetName: "Maria Gonzalez",
          targetImage: "",
          location: "Reserva en tu propiedad",
          checkInDate: "15 Nov",
          checkOutDate: "20 Nov",
        };
      } else {
        // CASO B: Estoy en contexto TENANT -> calificar una PROPIEDAD
        mockPending = {
          bookingId: "RES-T123",
          role: "guest",
          targetName: "Loft moderno en Miraflores",
          targetImage:
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
          location: "Miraflores, Lima",
          checkInDate: "15 Nov",
          checkOutDate: "20 Nov",
        };
      }

      // Delay para que se sienta natural
      setTimeout(() => {
        setPendingReview(mockPending);
        setIsOpen(true);
      }, 1500);
    } catch (error) {
      console.error("Error checking reviews:", error);
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!pendingReview) return;

    console.log(`Enviando reseña como ${pendingReview.role}:`, {
      bookingId: pendingReview.bookingId,
      rating,
      comment,
    });

    // AQUÍ: Conectar con tu servicio de reseñas real
    // await reviewService.create({ ... });

    setIsOpen(false);
  };

  if (!pendingReview) return null;

  return (
    <LeaveReviewModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSubmit={handleSubmitReview}
      reviewRole={pendingReview.role} // Define el tipo de reseña, pero colores siempre azules
      targetName={pendingReview.targetName}
      targetImage={pendingReview.targetImage}
      location={pendingReview.location}
      checkInDate={pendingReview.checkInDate}
      checkOutDate={pendingReview.checkOutDate}
    />
  );
}
