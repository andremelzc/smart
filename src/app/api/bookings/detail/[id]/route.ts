import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { getConnection } from "@/src/lib/database";
import { type DetailedBookingInfo } from "@/src/services/booking.service";
import oracledb from "oracledb";

/**
 * GET /api/bookings/detail/[id]
 * Obtiene información detallada de una reserva específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection: oracledb.Connection | null = null;

  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const userId = parseInt(session.user.id);
    const bookingId = parseInt(resolvedParams.id);

    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: "ID de reserva inválido" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Ejecutar el stored procedure
    const result = await connection.execute(
      `BEGIN
         BOOKING_PKG.get_detailed_booking_info(
           :p_booking_id,
           :p_user_id,
           :p_booking_info_cur
         );
       END;`,
      {
        p_booking_id: bookingId,
        p_user_id: userId,
        p_booking_info_cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const outBinds = result.outBinds as {
      p_booking_info_cur?: oracledb.ResultSet<unknown>;
    };

    // Procesar cursor de información detallada
    let bookingDetail: DetailedBookingInfo | null = null;

    if (outBinds.p_booking_info_cur) {
      try {
        const rows = await outBinds.p_booking_info_cur.getRows();
        
        if (rows.length === 0) {
          return NextResponse.json(
            { error: "Reserva no encontrada o sin acceso" },
            { status: 404 }
          );
        }

        const row = rows[0] as unknown[];
        
        bookingDetail = {
          // Datos básicos de la reserva
          bookingId: row[0] as number,
          status: row[1] as string,
          checkinDate: row[2] as string,
          checkoutDate: row[3] as string,
          guestCount: row[4] as number,
          totalAmount: row[5] as number,
          basePrice: row[6] as number,
          serviceFee: row[7] as number,
          cleaningFee: row[8] as number,
          taxes: row[9] as number,
          createdAt: row[10] as string,
          completedAt: row[11] as string | null,
          hostNote: row[12] as string | null,
          guestMessage: row[13] as string | null,
          checkinCode: row[14] as string | null,

          // Datos del huésped
          tenantId: row[15] as number,
          guestFirstName: row[16] as string,
          guestLastName: row[17] as string,
          guestEmail: row[18] as string,
          guestPhone: row[19] as string,

          // Datos de la propiedad
          propertyId: row[20] as number,
          propertyName: row[21] as string,
          hostId: row[22] as number,
          propertyAddress: row[23] as string,

          // Datos de pagos
          paymentStatus: row[24] as string | null,
          paymentMessage: row[25] as string | null,

          // Datos de reseñas
          hasHostReview: Boolean(row[26] as number),
          hasGuestReview: Boolean(row[27] as number),
        };

      } finally {
        await outBinds.p_booking_info_cur.close();
      }
    }

    if (!bookingDetail) {
      return NextResponse.json(
        { error: "No se pudo obtener la información de la reserva" },
        { status: 404 }
      );
    }

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      data: bookingDetail
    });

  } catch (error) {
    console.error("Error en get_detailed_booking_info:", error);

    // Manejar errores de Oracle específicos
    if (error && typeof error === 'object' && 'errorNum' in error) {
      const oracleError = error as { errorNum: number; message: string };
      console.error("Oracle Error:", oracleError.errorNum, oracleError.message);
      
      return NextResponse.json(
        { error: `Error en la base de datos: ${oracleError.message}` },
        { status: 500 }
      );
    }

    // Error genérico
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );

  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("Error al cerrar la conexión:", error);
      }
    }
  }
}