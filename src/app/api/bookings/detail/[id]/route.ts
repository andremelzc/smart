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
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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
        p_booking_info_cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
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

        console.log("📊 Filas obtenidas del cursor de reserva detallada:", rows.length);

        const row = rows[0] as Record<string, unknown>;

        console.log("📝 Datos de la fila:", row);

        // Helper para convertir fechas de Oracle a string ISO
        const toISOString = (value: unknown): string | null => {
          if (!value) return null;
          if (value instanceof Date) return value.toISOString();
          if (typeof value === 'string') return value;
          return String(value);
        };

        // Helper para convertir valores a string
        const toString = (value: unknown): string | null => {
          if (value === null || value === undefined) return null;
          return String(value);
        };

        // Helper para convertir valores a número
        const toNumber = (value: unknown): number => {
          if (value === null || value === undefined) return 0;
          return Number(value);
        };

        bookingDetail = {
          // Datos básicos de la reserva
          bookingId: toNumber(row.BOOKING_ID),
          status: toString(row.STATUS) || '',
          checkinDate: toISOString(row.CHECKIN_DATE) || '',
          checkoutDate: toISOString(row.CHECKOUT_DATE) || '',
          guestCount: toNumber(row.GUEST_COUNT),
          totalAmount: toNumber(row.TOTAL_AMOUNT),
          basePrice: toNumber(row.BASE_PRICE),
          serviceFee: toNumber(row.SERVICE_FEE),
          cleaningFee: toNumber(row.CLEANING_FEE),
          taxes: toNumber(row.TAXES),
          createdAt: toISOString(row.CREATED_AT) || '',
          completedAt: toISOString(row.COMPLETED_AT),
          hostNote: toString(row.HOST_NOTE),
          guestMessage: toString(row.GUEST_MESSAGE),
          checkinCode: toString(row.CHECKIN_CODE),

          // Datos del huésped
          tenantId: toNumber(row.TENANT_ID),
          guestFirstName: toString(row.GUEST_FIRST_NAME) || '',
          guestLastName: toString(row.GUEST_LAST_NAME) || '',
          guestEmail: toString(row.GUEST_EMAIL) || '',
          guestPhone: toString(row.GUEST_PHONE) || '',

          // Datos de la propiedad
          propertyId: toNumber(row.PROPERTY_ID),
          propertyName: toString(row.PROPERTY_NAME) || '',
          hostId: toNumber(row.HOST_ID),
          propertyAddress: toString(row.PROPERTY_ADDRESS) || '',

          // Datos de pagos
          paymentStatus: toString(row.PAYMENT_STATUS),
          paymentMessage: toString(row.PAYMENT_MESSAGE),

          // Datos de reseñas
          hasHostReview: Boolean(toNumber(row.HAS_HOST_REVIEW)),
          hasGuestReview: Boolean(toNumber(row.HAS_GUEST_REVIEW)),
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
      data: bookingDetail,
    });
  } catch (error) {
    console.error("Error en get_detailed_booking_info:", error);

    // Manejar errores de Oracle específicos
    if (error && typeof error === "object" && "errorNum" in error) {
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