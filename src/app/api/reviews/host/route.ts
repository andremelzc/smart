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
      // ========================================
      // 1. Obtener estadísticas usando V_HOST_REVIEW_STATS
      // ========================================
      const statsResult = await connection.execute(
        `BEGIN
          REVIEW_PKG.GET_HOST_REVIEW_STATS(
            p_host_id => :p_host_id,
            p_stats_cursor => :p_stats_cursor
          );
        END;`,
        {
          p_host_id: hostId,
          p_stats_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        }
      );

      const statsOutBinds = statsResult.outBinds as {
        p_stats_cursor?: oracledb.ResultSet<unknown>;
      };

      let stats: HostReviewStats = {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };

      if (statsOutBinds.p_stats_cursor) {
        try {
          const statsRows = await statsOutBinds.p_stats_cursor.getRows(1);
          
          if (Array.isArray(statsRows) && statsRows.length > 0) {
            const statsData = statsRows[0] as Record<string, unknown>;
            
            stats = {
              totalReviews: Number(statsData.TOTAL_REVIEWS) || 0,
              averageRating: Number(statsData.AVERAGE_RATING) || 0,
              ratingDistribution: {
                5: Number(statsData.RATING_5_COUNT) || 0,
                4: Number(statsData.RATING_4_COUNT) || 0,
                3: Number(statsData.RATING_3_COUNT) || 0,
                2: Number(statsData.RATING_2_COUNT) || 0,
                1: Number(statsData.RATING_1_COUNT) || 0,
              },
            };
          }
        } finally {
          await statsOutBinds.p_stats_cursor.close();
        }
      }

      // ========================================
      // 2. Obtener lista de reseñas usando V_HOST_REVIEWS_DETAIL
      // ========================================
      const reviewsResult = await connection.execute(
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

      const reviewsOutBinds = reviewsResult.outBinds as {
        p_reviews_cursor?: oracledb.ResultSet<unknown>;
      };

      const reviews: ReviewWithReviewer[] = [];

      if (reviewsOutBinds.p_reviews_cursor) {
        try {
          const rows = await reviewsOutBinds.p_reviews_cursor.getRows(100);

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
                comment: String(rowData.REVIEW_COMMENT || ''),  // Usar REVIEW_COMMENT del alias del SP
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
          await reviewsOutBinds.p_reviews_cursor.close();
        }
      }

      // Construir respuesta con datos de ambas vistas
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
