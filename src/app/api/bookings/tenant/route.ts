import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { getConnection } from "@/src/lib/database";
import oracledb from "oracledb";

export async function GET() {
  let connection: oracledb.Connection | null = null;

  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const tenantId = parseInt(session.user.id);
    connection = await getConnection();

    console.log("🔍 Buscando bookings para tenant_id:", tenantId);

    // Ejecutar el stored procedure
    const result = await connection.execute(
      `BEGIN
         BOOKING_PKG.get_bookings_by_tenant(
           :p_tenant_id,
           :p_bookings_cur
         );
       END;`,
      {
        p_tenant_id: tenantId,
        p_bookings_cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    const outBinds = result.outBinds as {
      p_bookings_cur?: oracledb.ResultSet<unknown>;
    };

    console.log("📦 Cursor recibido:", !!outBinds.p_bookings_cur);

    // Helper functions para conversión segura
    const toISOString = (value: unknown): string | null => {
      if (!value) return null;
      if (value instanceof Date) return value.toISOString();
      if (typeof value === 'string') return value;
      return String(value);
    };

    const toString = (value: unknown): string | null => {
      if (value === null || value === undefined) return null;
      return String(value);
    };

    const toNumber = (value: unknown): number => {
      if (value === null || value === undefined) return 0;
      return Number(value);
    };

    // Procesar cursor de bookings
    const bookings: Array<{
      bookingId: number;
      propertyId: number;
      checkinDate: string;
      checkoutDate: string;
      status: string;
      guestCount: number;
      title: string;
      formattedAddress: string;
      city: string;
      stateRegion: string;
      country: string;
      totalAmount: number;
      hostFirstName: string;
      hostLastName: string;
      hostNote: string | null;
      imageUrl: string | null;
    }> = [];

    if (outBinds.p_bookings_cur) {
      try {
        const bookingRows = await outBinds.p_bookings_cur.getRows();
        console.log("📊 Filas obtenidas:", bookingRows.length);

        for (const row of bookingRows) {
          const bookingRow = row as Record<string, unknown>;
          
          // Debug: imprime la primera fila para verificar nombres de columnas
          if (bookings.length === 0) {
            console.log("📝 Primera fila (nombres de columnas):", Object.keys(bookingRow));
          }

          bookings.push({
            bookingId: toNumber(bookingRow.BOOKING_ID),
            propertyId: toNumber(bookingRow.PROPERTY_ID),
            checkinDate: toISOString(bookingRow.CHECKIN_DATE) || '',
            checkoutDate: toISOString(bookingRow.CHECKOUT_DATE) || '',
            status: toString(bookingRow.STATUS) || '',
            guestCount: toNumber(bookingRow.GUEST_COUNT),
            title: toString(bookingRow.TITLE) || '',
            formattedAddress: toString(bookingRow.FORMATTED_ADDRESS) || '',
            city: toString(bookingRow.CITY) || '',
            stateRegion: toString(bookingRow.STATE_REGION) || '',
            country: toString(bookingRow.COUNTRY) || '',
            totalAmount: toNumber(bookingRow.TOTAL_AMOUNT),
            hostFirstName: toString(bookingRow.HOST_FIRST_NAME) || '',
            hostLastName: toString(bookingRow.HOST_LAST_NAME) || '',
            hostNote: toString(bookingRow.HOST_NOTE),
            imageUrl: toString(bookingRow.IMAGE_URL),
          });
        }
      } finally {
        await outBinds.p_bookings_cur.close();
      }
    }

    console.log("✅ Bookings procesados:", bookings.length);

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error en get_bookings_by_tenant:", error);

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
    // Cerrar conexión si existe
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error cerrando conexión:", closeError);
      }
    }
  }
}