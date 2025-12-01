/**
 * ========================================
 * API ROUTE: POST /api/reviews
 * ========================================
 * Crear una nueva reseña
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/app/api/auth/[...nextauth]/route';
import { getConnection, oracledb } from '@/src/lib/database';
import type { CreateReviewDto, CreateReviewResponse } from '@/src/types/dtos/reviews.dto';

export async function POST(request: NextRequest) {
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
    const body: CreateReviewDto = await request.json();

    // Validaciones
    if (!body.bookingId) {
      return NextResponse.json(
        { success: false, message: 'El bookingId es requerido' },
        { status: 400 }
      );
    }

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { success: false, message: 'El rating debe estar entre 1 y 5' },
        { status: 400 }
      );
    }

    if (!body.comment || body.comment.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: 'El comentario debe tener al menos 10 caracteres' },
        { status: 400 }
      );
    }

    if (!body.reviewType || !['guest', 'host'].includes(body.reviewType)) {
      return NextResponse.json(
        { success: false, message: 'El tipo de reseña debe ser "guest" o "host"' },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    const connection = await getConnection();

    try {
      // Llamar al procedimiento almacenado REVIEW_PKG.CREATE_REVIEW
      const result = await connection.execute(
        `BEGIN
          REVIEW_PKG.CREATE_REVIEW(
            p_booking_id => :p_booking_id,
            p_reviewer_id => :p_reviewer_id,
            p_review_type => :p_review_type,
            p_rating => :p_rating,
            p_comment => :p_comment,
            p_review_id => :p_review_id,
            p_success => :p_success,
            p_message => :p_message
          );
        END;`,
        {
          p_booking_id: body.bookingId,
          p_reviewer_id: userId,
          p_review_type: body.reviewType,
          p_rating: body.rating,
          p_comment: body.comment,
          p_review_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          p_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          p_message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
        },
        { autoCommit: true }
      );

      const outBinds = result.outBinds as {
        p_review_id?: number;
        p_success?: number;
        p_message?: string;
      };

      // Verificar resultado del procedimiento
      if (outBinds.p_success === 1) {
        const response: CreateReviewResponse = {
          success: true,
          message: outBinds.p_message || 'Reseña creada exitosamente',
          reviewId: outBinds.p_review_id,
        };

        return NextResponse.json(response, { status: 201 });
      } else {
        return NextResponse.json(
          {
            success: false,
            message: outBinds.p_message || 'Error al crear la reseña',
          },
          { status: 400 }
        );
      }
    } finally {
      await connection.close();
    }
  } catch (error) {
    console.error('❌ Error en POST /api/reviews:', error);
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
