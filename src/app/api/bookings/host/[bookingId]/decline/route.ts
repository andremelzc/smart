import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { getConnection } from "@/src/lib/database";
import oracledb from "oracledb";

const STATUS_PENDING = "PENDING";
const STATUS_DECLINED = "DECLINED";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId: bookingIdParam } = await context.params;
  let connection: oracledb.Connection | null = null;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const hostId = Number.parseInt(session.user.id, 10);
    if (!Number.isFinite(hostId)) {
      return NextResponse.json({ error: "Identificador de usuario no valido" }, { status: 400 });
    }

  const bookingId = Number.parseInt(bookingIdParam, 10);
    if (!Number.isFinite(bookingId)) {
      return NextResponse.json({ error: "Identificador de reserva no valido" }, { status: 400 });
    }

    const { hostNote } = (await request.json().catch(() => ({}))) as { hostNote?: unknown };
    const normalizedHostNote = typeof hostNote === "string" ? hostNote.trim() : null;

    connection = await getConnection();

    const bookingQuery = await connection.execute(
      `SELECT b.status, p.host_id
         FROM bookings b
         JOIN properties p ON p.property_id = b.property_id
        WHERE b.booking_id = :bookingId`,
      { bookingId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const bookingRow = bookingQuery.rows?.[0] as ({ STATUS: string; HOST_ID: number }) | undefined;

    if (!bookingRow) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    if (bookingRow.HOST_ID !== hostId) {
      return NextResponse.json({ error: "No esta autorizado para gestionar esta reserva" }, { status: 403 });
    }

    if ((bookingRow.STATUS || "").toUpperCase() !== STATUS_PENDING) {
      return NextResponse.json({ error: "La reserva no se encuentra pendiente" }, { status: 409 });
    }

    await connection.execute(
      `UPDATE bookings
          SET status = :status,
              declined_at = SYSDATE,
              host_note = :hostNote
        WHERE booking_id = :bookingId`,
      {
        status: STATUS_DECLINED,
        hostNote: normalizedHostNote ?? null,
        bookingId,
      },
      { autoCommit: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        bookingId,
        status: STATUS_DECLINED,
        declinedAt: new Date().toISOString(),
        hostNote: normalizedHostNote ?? null,
      },
    });
  } catch (error) {
    console.error("Error al rechazar reserva:", error);
    return NextResponse.json({ error: "No se pudo rechazar la reserva" }, { status: 500 });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error cerrando conexion:", closeError);
      }
    }
  }
}
