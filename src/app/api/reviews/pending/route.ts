/**
 * ========================================
 * API ROUTE: GET /api/reviews/pending
 * ========================================
 * Obtiene las reseñas pendientes del usuario autenticado
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/app/api/auth/[...nextauth]/route';
import { getConnection, oracledb } from '@/src/lib/database';
import type { GetPendingReviewsResponse, PendingReview } from '@/src/types/dtos/reviews.dto';

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

    const userId = Number(session.user.id);

    // Conectar a la base de datos
    const connection = await getConnection();

    try {
      // Llamar al procedimiento almacenado REVIEW_PKG.GET_USER_PENDING_REVIEWS
      const result = await connection.execute(
        `BEGIN
          REVIEW_PKG.GET_USER_PENDING_REVIEWS(
            p_user_id => :p_user_id,
            p_pending_cursor => :p_pending_cursor
          );
        END;`,
        {
          p_user_id: userId,
          p_pending_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        }
      );

      const outBinds = result.outBinds as {
        p_pending_cursor?: oracledb.ResultSet<unknown>;
      };

      const pendingReviews: PendingReview[] = [];

      if (outBinds.p_pending_cursor) {
        try {
          // ✅ Configurar outFormat para obtener columnas por nombre
          const rows = await outBinds.p_pending_cursor.getRows(100);

          if (Array.isArray(rows)) {
            for (const row of rows) {
              // Con outFormat configurado globalmente, row ya es un objeto con nombres de columnas
              const rowData = row as Record<string, unknown>;

              pendingReviews.push({
                reviewId: Number(rowData.REVIEW_ID),
                bookingId: Number(rowData.BOOKING_ID),
                userId: Number(rowData.USER_ID),
                reviewType: String(rowData.REVIEW_TYPE) as 'guest' | 'host',
                createdAt: rowData.CREATED_AT ? new Date(String(rowData.CREATED_AT)).toISOString() : '',
                isCompleted: false,
                // Datos del booking
                checkinDate: rowData.CHECKIN_DATE ? new Date(String(rowData.CHECKIN_DATE)).toISOString() : '',
                checkoutDate: rowData.CHECKOUT_DATE ? new Date(String(rowData.CHECKOUT_DATE)).toISOString() : '',
                bookingStatus: String(rowData.BOOKING_STATUS),
                // Datos de la propiedad
                propertyId: Number(rowData.PROPERTY_ID),
                propertyTitle: String(rowData.PROPERTY_TITLE),
                propertyImage: rowData.PROPERTY_IMAGE ? String(rowData.PROPERTY_IMAGE) : undefined,
                city: String(rowData.CITY),
                stateRegion: String(rowData.STATE_REGION),
                // Datos del otro usuario
                otherUserFirstName: String(rowData.OTHER_USER_FIRST_NAME),
                otherUserLastName: String(rowData.OTHER_USER_LAST_NAME),
                otherUserImage: rowData.OTHER_USER_IMAGE ? String(rowData.OTHER_USER_IMAGE) : undefined,
              });
            }
          }
        } finally {
          await outBinds.p_pending_cursor.close();
        }
      }

      const response: GetPendingReviewsResponse = {
        success: true,
        data: pendingReviews,
        count: pendingReviews.length,
      };

      return NextResponse.json(response);
    } finally {
      await connection.close();
    }
  } catch (error) {
    console.error('❌ Error en GET /api/reviews/pending:', error);
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
