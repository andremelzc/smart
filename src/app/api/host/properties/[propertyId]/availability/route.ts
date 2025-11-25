import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { executeQuery, oracledb } from "@/src/lib/database";

// --- Definiciones de Tipos ---

// 1. Tipo para los datos que esperamos de GET_CALENDAR
type CalendarDay = {
  date: string;
  isAvailable: number;
  price: number | null;
  status: string;
};

// 2. Tipo para la respuesta de SET_AVAILABILITY (el SP)
type SetAvailabilityResult = {
  errorCode: number;
};

// 3. Tipo para la respuesta del helper de validación
type HostAccessResult = {
  // Oracle devuelve los alias en mayúsculas por defecto
  EXISTS: number;
};

/**
 * Helper: Mapea el status de Oracle al reason esperado por el frontend
 */
function mapStatusToReason(
  status: string
): "available" | "booked" | "blocked" | "maintenance" | "special" {
  switch (status.toLowerCase()) {
    case "reserved":
      return "booked";
    case "blocked":
      return "blocked";
    case "maintenance":
      return "maintenance";
    case "special":
      return "special";
    case "default":
    default:
      return "available";
  }
}

/**
 * Helper de seguridad: Verifica si el anfitrión autenticado es el dueño de la propiedad.
 */
async function validateHostAccess(
  hostId: number | string,
  propertyId: number
): Promise<boolean> {
  try {
    const result = (await executeQuery(
      `SELECT 1 AS "EXISTS" 
       FROM PROPERTIES 
       WHERE PROPERTY_ID = :propertyId AND HOST_ID = :hostId`,
      { propertyId, hostId }
      // ✅ CASTING: Le decimos a TS la forma de 'rows'
    )) as oracledb.Result<HostAccessResult>;

    return (result.rows && result.rows.length > 0) || false;
  } catch (error) {
    console.error("Error en validación de acceso:", error);
    return false;
  }
}

/**
 * GET /api/host/properties/[propertyId]/availability
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const session = await getServerSession(authOptions);

  // Solo requiere estar autenticado
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "No autorizado. Debes iniciar sesión." },
      { status: 401 }
    );
  }

  const resolvedParams = await params;
  const propertyIdNum = parseInt(resolvedParams.propertyId, 10);
  const userId = parseInt(session.user.id);

  const { searchParams } = request.nextUrl;
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  if (!month || !year || isNaN(propertyIdNum)) {
    return NextResponse.json(
      {
        message:
          "Parámetros inválidos (propertyId, month, year son requeridos)",
      },
      { status: 400 }
    );
  }

  try {
    // Verificar que el usuario sea dueño de la propiedad
    const hasAccess = await validateHostAccess(userId, propertyIdNum);
    if (!hasAccess) {
      return NextResponse.json(
        { message: "Acceso denegado. No eres el dueño de esta propiedad." },
        { status: 403 }
      );
    }

    const calendarData = (await executeQuery(
      `SELECT 
          TO_CHAR(CAL_DATE, 'YYYY-MM-DD') AS "date",
          IS_AVAILABLE AS "isAvailable",
          PRICE AS "price",
          STATUS AS "status"
      FROM TABLE(PROPERTY_PKG.GET_CALENDAR(
        p_property_id => :propertyId,
        p_month => :month,
        p_year => :year
      ))`,
      {
        propertyId: propertyIdNum,
        month: parseInt(month, 10),
        year: parseInt(year, 10),
      }
    )) as oracledb.Result<CalendarDay>;

    // Transformar los datos de Oracle al formato esperado por el frontend
    const transformedData = (calendarData.rows || []).map((day) => ({
      date: day.date,
      available: Boolean(day.isAvailable), // Convertir 0/1 a boolean
      reason: mapStatusToReason(day.status), // Mapear status de Oracle a reason del frontend
      price: day.price,
    }));

    return NextResponse.json(transformedData);
  } catch (err) {
    console.error("Error en GET /api/host/properties/[id]/availability:", err);
    return NextResponse.json(
      { message: "Error interno del servidor al obtener el calendario" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/host/properties/[propertyId]/availability
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const session = await getServerSession(authOptions);

  // Solo requiere estar autenticado
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "No autorizado. Debes iniciar sesión." },
      { status: 401 }
    );
  }

  const resolvedParams = await params;
  const propertyIdNum = parseInt(resolvedParams.propertyId, 10);
  const userId = parseInt(session.user.id);

  if (isNaN(propertyIdNum)) {
    return NextResponse.json(
      { message: "ID de propiedad inválido" },
      { status: 400 }
    );
  }

  try {
  const body = await request.json();
  // Log body for debugging server-side 500 errors
  console.log("Incoming POST /availability body:", JSON.stringify(body));
  const { startDate, endDate, kind, pricePerNight } = body;

    if (!startDate || !endDate || !kind) {
      return NextResponse.json(
        { message: "Faltan parámetros (startDate, endDate, kind)" },
        { status: 400 }
      );
    }
    if (kind === "special" && !pricePerNight) {
      return NextResponse.json(
        {
          message:
            'El precio (pricePerNight) es requerido para el tipo "special"',
        },
        { status: 400 }
      );
    }

    const hasAccess = await validateHostAccess(userId, propertyIdNum);
    if (!hasAccess) {
      return NextResponse.json(
        { message: "Acceso denegado. No eres el dueño de esta propiedad." },
        { status: 403 }
      );
    }

    // Prepare binds for SP call (log them for debugging)
    const binds = {
      propertyId: propertyIdNum,
      startDate: startDate,
      endDate: endDate,
      kind: kind,
      pricePerNight: pricePerNight || null,
      errorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };
    console.log("Calling PROPERTY_PKG.SET_AVAILABILITY with binds:", {
      propertyId: binds.propertyId,
      startDate: binds.startDate,
      endDate: binds.endDate,
      kind: binds.kind,
      pricePerNight: binds.pricePerNight,
    });

    const result = (await executeQuery(
      `BEGIN
        PROPERTY_PKG.SET_AVAILABILITY(
          P_PROPERTY_ID => :propertyId,
          P_START_DATE => TO_DATE(:startDate, 'YYYY-MM-DD'),
          P_END_DATE => TO_DATE(:endDate, 'YYYY-MM-DD'),
          P_KIND => :kind,
          P_PRICE_PER_NIGHT => :pricePerNight,
          P_ERROR_CODE => :errorCode
        );
      END;`,
      binds
      // ✅ CASTING: Le decimos a TS la forma de 'outBinds'
    )) as oracledb.Result<SetAvailabilityResult>;

    console.log("SET_AVAILABILITY result outBinds:", result.outBinds);

    // Ahora TS sabe que 'result.outBinds' es 'SetAvailabilityResult | undefined'
    const errorCode = result.outBinds?.errorCode;

    // Manejo de códigos de error del SP
    if (errorCode === 1) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Conflicto: Ya existe una reserva confirmada en esas fechas. No puedes bloquear o poner en mantenimiento.",
        },
        { status: 409 }
      );
    }

    if (errorCode === 2) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Conflicto: Ya existe otro ajuste de disponibilidad en ese rango de fechas. Por favor, elimina el ajuste existente primero.",
        },
        { status: 409 }
      );
    }

    if (errorCode !== 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Error al guardar en la base de datos. Por favor, intenta nuevamente.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Disponibilidad actualizada correctamente",
    });
  } catch (err) {
    console.error("Error en POST /api/host/properties/[id]/availability:", err);
    return NextResponse.json(
      { message: "Error interno del servidor al guardar la disponibilidad" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/host/properties/[propertyId]/availability
 * Elimina un ajuste de disponibilidad específico
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const session = await getServerSession(authOptions);

  // Solo requiere estar autenticado
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "No autorizado. Debes iniciar sesión." },
      { status: 401 }
    );
  }

  const resolvedParams = await params;
  const propertyIdNum = parseInt(resolvedParams.propertyId, 10);
  const userId = parseInt(session.user.id);

  if (isNaN(propertyIdNum)) {
    return NextResponse.json(
      { message: "ID de propiedad inválido" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: "Faltan parámetros (startDate, endDate)" },
        { status: 400 }
      );
    }

    // Verificar que el usuario sea dueño de la propiedad
    const hasAccess = await validateHostAccess(userId, propertyIdNum);
    if (!hasAccess) {
      return NextResponse.json(
        { message: "Acceso denegado. No eres el dueño de esta propiedad." },
        { status: 403 }
      );
    }

    // Llamar al SP que elimina todos los ajustes que se superpongan con el rango
    const result = (await executeQuery(
      `BEGIN
        PROPERTY_PKG.SP_REMOVE_AVAILABILITY(
          P_PROPERTY_ID => :propertyId,
          P_START_DATE => TO_DATE(:startDate, 'YYYY-MM-DD'),
          P_END_DATE => TO_DATE(:endDate, 'YYYY-MM-DD'),
          P_ROWS_DELETED => :rowsDeleted,
          P_ERROR_CODE => :errorCode
        );
      END;`,
      {
        propertyId: propertyIdNum,
        startDate: startDate,
        endDate: endDate,
        rowsDeleted: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        errorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    )) as oracledb.Result<{ errorCode: number; rowsDeleted: number }>;

    const errorCode = result.outBinds?.errorCode;
    const rowsDeleted = result.outBinds?.rowsDeleted || 0;

    // Manejo de códigos de error del SP
    if (errorCode === 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Propiedad no encontrada.",
        },
        { status: 404 }
      );
    }

    if (errorCode === 2) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No se encontraron ajustes para eliminar en el rango seleccionado.",
        },
        { status: 404 }
      );
    }

    if (errorCode === 99 || errorCode !== 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Error al eliminar los ajustes en la base de datos. Por favor, intenta nuevamente.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${rowsDeleted} ajuste(s) eliminado(s) correctamente`,
      rowsDeleted,
    });
  } catch (err) {
    console.error(
      "Error en DELETE /api/host/properties/[id]/availability:",
      err
    );
    return NextResponse.json(
      { message: "Error interno del servidor al eliminar el ajuste" },
      { status: 500 }
    );
  }
}
