/**
 * ========================================
 * API ROUTE: GET /api/reviews/host
 * ========================================
 * Obtiene las reseñas recibidas por el host autenticado
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/app/api/auth/[...nextauth]/route';
import { getConnection, oracledb } from '@/src/lib/database';
import type {
  GetHostReviewsResponse,
  ReviewWithReviewer,
  HostReviewStats,
} from '@/src/types/dtos/reviews.dto';

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      );
    }

    const hostId = Number(session.user.id);

    // Conectar a la base de datos
    const connection = await getConnection();

    try {
      // Llamar al procedimiento almacenado REVIEW_PKG.GET_HOST_RECEIVED_REVIEWS
      const result = await connection.execute(
        `BEGIN
          REVIEW_PKG.GET_HOST_RECEIVED_REVIEWS(
            p_host_id => :p_host_id,
            p_reviews_cursor => :p_reviews_cursor
          );
        END;`,
        {
          p_host_id: hostId,
          p_reviews_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        }
      );

      const outBinds = result.outBinds as {
        p_reviews_cursor?: oracledb.ResultSet<unknown>;
      };

      const reviews: ReviewWithReviewer[] = [];

      if (outBinds.p_reviews_cursor) {
        try {
          const rows = await outBinds.p_reviews_cursor.getRows();

          if (Array.isArray(rows)) {
            for (const row of rows) {
              const rowData = row as Record<string, unknown>;

              reviews.push({
                reviewId: Number(rowData.REVIEW_ID),
                bookingId: Number(rowData.BOOKING_ID),
                reviewerId: Number(rowData.REVIEWER_ID),
                revieweeId: hostId,
                reviewType: 'guest',
                rating: Number(rowData.RATING),
                comment: String(rowData.COMMENT),
                createdAt: rowData.CREATED_AT
                  ? new Date(String(rowData.CREATED_AT)).toISOString()
                  : '',
                updatedAt: rowData.CREATED_AT
                  ? new Date(String(rowData.CREATED_AT)).toISOString()
                  : '',
                reviewerFirstName: String(rowData.REVIEWER_FIRST_NAME),
                reviewerLastName: String(rowData.REVIEWER_LAST_NAME),
                reviewerImage: rowData.REVIEWER_IMAGE
                  ? String(rowData.REVIEWER_IMAGE)
                  : undefined,
                propertyId: Number(rowData.PROPERTY_ID),
                propertyTitle: String(rowData.PROPERTY_TITLE),
                checkinDate: rowData.CHECKIN_DATE
                  ? new Date(String(rowData.CHECKIN_DATE)).toISOString()
                  : undefined,
                checkoutDate: rowData.CHECKOUT_DATE
                  ? new Date(String(rowData.CHECKOUT_DATE)).toISOString()
                  : undefined,
              });
            }
          }
        } finally {
          await outBinds.p_reviews_cursor.close();
        }
      }

      // Calcular estadísticas
      const totalReviews = reviews.length;
      const averageRating =
        totalReviews > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          : 0;

      const ratingDistribution = {
        5: reviews.filter((r) => r.rating === 5).length,
        4: reviews.filter((r) => r.rating === 4).length,
        3: reviews.filter((r) => r.rating === 3).length,
        2: reviews.filter((r) => r.rating === 2).length,
        1: reviews.filter((r) => r.rating === 1).length,
      };

      const stats: HostReviewStats = {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      };

      const response: GetHostReviewsResponse = {
        success: true,
        data: reviews,
        stats,
      };

      return NextResponse.json(response);
    } finally {
      await connection.close();
    }
  } catch (error) {
    console.error('❌ Error en GET /api/reviews/host:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
