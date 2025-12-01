"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LeaveReviewModal } from "./LeaveReviewModal";
import { useAuth } from "@/src/hooks/useAuth";
import { reviewService } from "@/src/services/review.service";

// Tipo local para el modal (mapeo de PendingReview de la API)
type ReviewModalData = {
  bookingId: number;
  targetName: string;
  targetImage?: string;
  role: "guest" | "host";
  location?: string;
  checkInDate?: string;
  checkOutDate?: string;
};

export function ReviewNudge() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingReview, setPendingReview] = useState<ReviewModalData | null>(
    null
  );

  useEffect(() => {
    // Solo ejecutar si el usuario está autenticado y en página relevante
    const isRelevantPage = pathname === "/" || pathname === "/host";

    if (isAuthenticated && isRelevantPage && !isOpen) {
      checkPendingReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, pathname]);

  const checkPendingReviews = async () => {
    try {
      // Obtener la primera pending review real de la API
      const firstPending = await reviewService.getFirstPendingReview();

      if (!firstPending) return;

      // Determinar targetName y targetImage según el tipo de reseña
      let targetName: string;
      let targetImage: string | undefined;
      let location: string | undefined;

      if (firstPending.reviewType === 'guest') {
        // El usuario es inquilino, opina sobre la propiedad
        targetName = firstPending.propertyTitle;
        targetImage = firstPending.propertyImage;
        location = `${firstPending.city}, ${firstPending.stateRegion}`;
      } else {
        // El usuario es host, opina sobre el huésped
        targetName = reviewService.formatFullName(
          firstPending.otherUserFirstName,
          firstPending.otherUserLastName
        );
        targetImage = firstPending.otherUserImage;
        location = 'Reserva en tu propiedad';
      }

      // Mapear a ReviewModalData
      const modalData: ReviewModalData = {
        bookingId: firstPending.bookingId,
        role: firstPending.reviewType,
        targetName,
        targetImage,
        location,
        checkInDate: reviewService.formatDate(firstPending.checkinDate),
        checkOutDate: reviewService.formatDate(firstPending.checkoutDate),
      };

      // Delay para que se sienta natural
      setTimeout(() => {
        setPendingReview(modalData);
        setIsOpen(true);
      }, 1500);
    } catch (error) {
      console.error("Error checking reviews:", error);
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!pendingReview) return;

    try {
      console.log(`Enviando reseña como ${pendingReview.role}:`, {
        bookingId: pendingReview.bookingId,
        rating,
        comment,
      });

      // Enviar la reseña a la API
      await reviewService.createReview({
        bookingId: pendingReview.bookingId,
        reviewType: pendingReview.role,
        rating,
        comment,
      });

      console.log('✅ Reseña creada exitosamente');
      setIsOpen(false);
    } catch (error) {
      console.error('❌ Error al crear reseña:', error);
      // Podrías mostrar un toast o notificación de error aquí
      throw error; // Dejar que el modal lo maneje
    }
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
