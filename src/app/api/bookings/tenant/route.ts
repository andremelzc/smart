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

    // Diagnóstico adicional: ejecutar la misma consulta SELECT directamente
    let diagRows: unknown[] = [];
    try {
      const diagnosticSql = `SELECT b.BOOKING_ID,
                                     b.PROPERTY_ID,
                                     b.CHECKIN_DATE,
                                     b.CHECKOUT_DATE,
                                     b.STATUS,
                                     b.GUEST_COUNT,
                                     p.TITLE,
                                     p.FORMATTED_ADDRESS,
                                     p.CITY,
                                     p.STATE_REGION,
                                     p.COUNTRY,
                                     b.TOTAL_AMOUNT,
                                     u.FIRST_NAME,
                                     u.LAST_NAME
                              FROM bookings b
                              JOIN properties p ON b.property_id = p.property_id
                              JOIN users u ON p.host_id = u.user_id
                              WHERE b.tenant_id = :tid
                              ORDER BY b.booking_id`;
      const diagRes = await connection.execute(diagnosticSql, { tid: tenantId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      diagRows = (diagRes.rows as unknown[]) || [];
      console.log('🔎 DIAGNÓSTICO - SELECT directo con la misma conexión devuelve filas:', diagRows.length);
      console.log('🔎 DIAGNÓSTICO - Filas (direct):', diagRows);
    } catch (diagErr) {
      console.error('Error al ejecutar SELECT diagnóstico:', diagErr);
    }

    console.log("=== PARÁMETROS STORED PROCEDURE ===");
    console.log("🔍 Tenant ID enviado al SP:", tenantId);
    console.log("📞 SP: BOOKING_PKG.get_bookings_by_tenant");
    console.log("🔢 Tipo de tenant_id:", typeof tenantId);
    
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
        // Leer el cursor por bloques (robusto frente a límites de getRows)
        const fetchedRows: unknown[] = [];
        const fetchSize = 100;
        while (true) {
          const rowsChunk = await outBinds.p_bookings_cur.getRows(fetchSize);
          if (!rowsChunk || rowsChunk.length === 0) break;
          fetchedRows.push(...rowsChunk);
          // Si recibimos menos que fetchSize, probablemente ya no hay más
          if (rowsChunk.length < fetchSize) break;
        }

        console.log("=== ANÁLISIS DETALLADO DEL CURSOR ===");
        console.log("Tenant ID:", tenantId);
        console.log(`📊 Total filas recibidas del cursor: ${fetchedRows.length}`);
        console.log("🔍 Raw cursor data:", fetchedRows);

        if (fetchedRows.length === 0) {
          console.log("⚠️ CURSOR VACÍO - No hay datos del stored procedure");
        }

        // Si la consulta directa devuelve más filas que el SP, usar la versión directa (fallback)
        let sourceRows: unknown[] = fetchedRows;
        if (diagRows.length > 0 && diagRows.length !== fetchedRows.length) {
          console.warn('⚠️ Inconsistencia detectada: el SELECT directo y el cursor del SP devuelven distinta cantidad. Usando filas directas como fallback.');
          sourceRows = diagRows;
        }

        for (let i = 0; i < sourceRows.length; i++) {
          const row = sourceRows[i];
          const bookingRow = row as Record<string, unknown>;

          console.log(`📄 Procesando booking ${i + 1}/${sourceRows.length}:`, {
            bookingId: bookingRow.BOOKING_ID,
            status: bookingRow.STATUS,
            title: bookingRow.TITLE
          });

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
            hostFirstName: toString(bookingRow.FIRST_NAME) || '',
            hostLastName: toString(bookingRow.LAST_NAME) || '',
            hostNote: toString(bookingRow.HOST_NOTE),
            imageUrl: toString(bookingRow.URL),
          });
        }
        
        console.log("=== RESUMEN DE PROCESAMIENTO ===");
        console.log(`📊 Filas leídas del cursor (fetchedRows): ${fetchedRows.length}`);
        console.log(`📊 Filas del SELECT directo (diagRows): ${diagRows.length}`);
        console.log(`📤 Bookings procesados (output): ${bookings.length}`);
        console.log(`🎯 IDs de bookings procesados:`, bookings.map(b => b.bookingId));

        // Comparar usando la fuente realmente utilizada (sourceRows)
        const sourceCount = Math.max(fetchedRows.length, diagRows.length);
        if (sourceCount !== bookings.length) {
          console.error(`❌ DISCREPANCIA: fuente esperada tiene ${sourceCount} filas pero se procesaron ${bookings.length}`);
        }
      } finally {
        await outBinds.p_bookings_cur.close();
      }
    } else {
      console.log("❌ CURSOR NULO - El stored procedure no retornó cursor");
    }

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