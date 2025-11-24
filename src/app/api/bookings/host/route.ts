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
          const bookingRow = row as unknown[];

          bookings.push({
            bookingId: bookingRow[0] as number,
            checkinDate: bookingRow[1] as string,
            checkoutDate: bookingRow[2] as string,
            status: bookingRow[3] as string,
            guestCount: bookingRow[4] as number,
            totalAmount: bookingRow[5] as number,
            propertyTitle: bookingRow[6] as string,
            tenantFirstName: bookingRow[7] as string,
            tenantLastName: bookingRow[8] as string,
            imageUrl: bookingRow[9] as string | null,
          });
        }
      } finally {
        await outBinds.p_bookings_cur.close();
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
