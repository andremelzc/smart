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

    const hostId = parseInt(session.user.id);
    connection = await getConnection();

    // Ejecutar el stored procedure
    const result = await connection.execute(
      `BEGIN
         BOOKING_PKG.get_bookings_by_host(
           :p_host_id,
           :p_bookings_cur
         );
       END;`,
      {
        p_host_id: hostId,
        p_bookings_cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    const outBinds = result.outBinds as {
      p_bookings_cur?: oracledb.ResultSet<unknown>;
    };

    // Procesar cursor de bookings
    const bookings: Array<{
      bookingId: number;
      checkinDate: string;
      checkoutDate: string;
      status: string;
      guestCount: number;
      totalAmount: number;
      propertyTitle: string;
      tenantFirstName: string;
      tenantLastName: string;
      imageUrl: string | null;
    }> = [];

    if (outBinds.p_bookings_cur) {
      try {
        const bookingRows = await outBinds.p_bookings_cur.getRows();

        for (const row of bookingRows) {
          // Cambio aquí: de unknown[] a Record<string, unknown>
          const bookingRow = row as Record<string, unknown>;
          console.log("📝 Fila de booking (raw):", bookingRow);
          console.log("Primera columna (bookingId):", bookingRow.BOOKING_ID);
          
          bookings.push({
            bookingId: bookingRow.BOOKING_ID as number,
            checkinDate: bookingRow.CHECKIN_DATE as string,
            checkoutDate: bookingRow.CHECKOUT_DATE as string,
            status: bookingRow.STATUS as string,
            guestCount: bookingRow.GUEST_COUNT as number,
            totalAmount: bookingRow.TOTAL_AMOUNT as number,
            propertyTitle: bookingRow.PROPERTY_TITLE as string,
            tenantFirstName: bookingRow.TENANT_FIRST_NAME as string,
            tenantLastName: bookingRow.TENANT_LAST_NAME as string,
            imageUrl: bookingRow.URL as string | null,
          });
        }
      } finally {
        await outBinds.p_bookings_cur.close();
        console.log("Bookings: ", bookings.length);
        console.log("Bookings data: ", bookings);
      }
    }

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error en get_bookings_by_host:", error);

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