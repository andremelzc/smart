import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { getConnection } from "@/src/lib/database";
import oracledb from "oracledb";

export async function POST(request: NextRequest) {
  let connection: oracledb.Connection | null = null;

  try {
    // 1. Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para reservar" },
        { status: 401 }
      );
    }

    const tenantId = parseInt(session.user.id);
    const body = await request.json();

    const {
      propertyId,
      checkIn,
      checkOut,
      guests, // GuestCounts object
      paymentDetails,
    } = body;

    // Validación básica
    if (!propertyId || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { error: "Faltan datos requeridos para la reserva" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // 2. Obtener detalles de la propiedad para calcular precios
    const propertyResult = await connection.execute(
      `SELECT base_price_night, currency_code, cleaning_fee, service_fee, taxes 
       FROM properties p
       LEFT JOIN (
         -- Mocking fees since they are not in PROPERTIES table directly in init.sql
         -- Assuming logic or default values if not present
         SELECT 0 as cleaning_fee, 0 as service_fee, 0 as taxes FROM DUAL
       ) f ON 1=1
       WHERE property_id = :id`,
      [propertyId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!propertyResult.rows || propertyResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Propiedad no encontrada" },
        { status: 404 }
      );
    }

    const property = propertyResult.rows[0] as {
      BASE_PRICE_NIGHT: number;
      CURRENCY_CODE: string;
    };
    const basePrice = property.BASE_PRICE_NIGHT;
    const currencyCode = property.CURRENCY_CODE;

    // 3. Calcular noches y totales
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const nightCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (nightCount <= 0) {
      return NextResponse.json(
        { error: "Las fechas de reserva no son válidas" },
        { status: 400 }
      );
    }

    // Calcular total de huéspedes
    const guestCount = (guests.adults || 0) + (guests.children || 0);

    // Calcular montos
    const priceNights = basePrice * nightCount;
    // Usamos valores por defecto o calculados (ej. 14% servicio)
    const cleaningFee = 0; // Podría venir de DB
    const serviceFee = Math.round(priceNights * 0.14); // 14% fee
    const taxes = 0;
    const totalAmount = priceNights + cleaningFee + serviceFee + taxes;

    // 4. Insertar Reserva
    // Nota: Usamos RETURNING para obtener el ID generado
    const bookingResult = await connection.execute(
      `INSERT INTO bookings (
         property_id, tenant_id, checkin_date, checkout_date, 
         guest_count, currency_code, night_count, price_nights, 
         cleaning_fee, service_fee, taxes, total_amount, created_at
       ) VALUES (
         :propertyId, :tenantId, TO_DATE(:checkIn, 'YYYY-MM-DD'), TO_DATE(:checkOut, 'YYYY-MM-DD'),
         :guestCount, :currencyCode, :nightCount, :priceNights,
         :cleaningFee, :serviceFee, :taxes, :totalAmount, SYSDATE
       ) RETURNING booking_id INTO :bookingId`,
      {
        propertyId,
        tenantId,
        checkIn: checkIn.split("T")[0], // Asegurar formato YYYY-MM-DD
        checkOut: checkOut.split("T")[0],
        guestCount,
        currencyCode,
        nightCount,
        priceNights,
        cleaningFee,
        serviceFee,
        taxes,
        totalAmount,
        bookingId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: false } // Haremos commit al final
    );

    const bookingId = (bookingResult.outBinds as { bookingId: number[] })
      .bookingId[0];

    // 5. Insertar Pago (Simulado)
    if (paymentDetails) {
      await connection.execute(
        `INSERT INTO payments (
           booking_id, amount, currency_code, status, 
           direction, message, created_at
         ) VALUES (
           :bookingId, :amount, :currencyCode, 'completed',
           'charge', 'Pago con tarjeta', SYSDATE
         )`,
        {
          bookingId,
          amount: totalAmount,
          currencyCode,
        },
        { autoCommit: false }
      );
    }

    // Commit de la transacción
    await connection.commit();

    return NextResponse.json({
      success: true,
      data: {
        bookingId,
        status: "accepted",
        totalAmount,
        currencyCode,
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (err) {
        console.error("Error rolling back:", err);
      }
    }
    return NextResponse.json(
      { error: "Error al procesar la reserva" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}
