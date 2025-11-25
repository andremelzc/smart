import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { getConnection } from "@/src/lib/database";
import oracledb from "oracledb";

const STATUS_CANCELLED = "CANCELLED";

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

    const tenantId = Number.parseInt(session.user.id, 10);
    if (!Number.isFinite(tenantId)) {
      return NextResponse.json(
        { error: "Identificador de usuario no valido" },
        { status: 400 }
      );
    }

    const bookingId = Number.parseInt(bookingIdParam, 10);
    if (!Number.isFinite(bookingId)) {
      return NextResponse.json(
        { error: "Identificador de reserva no valido" },
        { status: 400 }
      );
    }

    const { tenantNote } = (await request.json().catch(() => ({}))) as {
      tenantNote?: unknown;
    };
    const normalizedTenantNote =
      typeof tenantNote === "string" ? tenantNote.trim() : null;

    connection = await getConnection();

    const bookingQuery = await connection.execute(
      `SELECT b.status, b.tenant_id, b.checkin_date
         FROM bookings b
        WHERE b.booking_id = :bookingId`,
      { bookingId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const bookingRow = bookingQuery.rows?.[0] as
      | { STATUS: string; TENANT_ID: number; CHECKIN_DATE: Date }
      | undefined;

    if (!bookingRow) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    if (bookingRow.TENANT_ID !== tenantId) {
      return NextResponse.json(
        { error: "No esta autorizado para cancelar esta reserva" },
        { status: 403 }
      );
    }

    // Log para debuggear
    console.log(
      `Cancelation attempt - BookingId: ${bookingId}, Status: ${bookingRow.STATUS}, CheckIn: ${bookingRow.CHECKIN_DATE}`
    );

    const currentStatus = (bookingRow.STATUS || "").toUpperCase();
    const allowedStatuses = ["ACCEPTED", "CONFIRMED", "PENDING"];

    if (!allowedStatuses.includes(currentStatus)) {
      console.log(`Status not allowed for cancellation: ${currentStatus}`);
      return NextResponse.json(
        {
          error: `No se puede cancelar una reserva en estado ${currentStatus.toLowerCase()}`,
        },
        { status: 409 }
      );
    }

    const checkinDate = new Date(bookingRow.CHECKIN_DATE);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Permitir cancelación hasta el final del día

    console.log(`Date comparison - CheckIn: ${checkinDate}, Today: ${today}`);

    if (checkinDate < today) {
      return NextResponse.json(
        { error: "No se puede cancelar después de la fecha de check-in" },
        { status: 409 }
      );
    }

    await connection.execute(
      `UPDATE bookings
          SET status = :status,
              tenant_note = :tenantNote
        WHERE booking_id = :bookingId`,
      {
        status: STATUS_CANCELLED,
        tenantNote: normalizedTenantNote ?? null,
        bookingId,
      },
      { autoCommit: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        bookingId,
        status: STATUS_CANCELLED,
        tenantNote: normalizedTenantNote ?? null,
      },
    });
  } catch (error) {
    console.error("Error al cancelar reserva:", error);
    return NextResponse.json(
      { error: "No se pudo cancelar la reserva" },
      { status: 500 }
    );
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
