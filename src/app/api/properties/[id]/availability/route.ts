import { NextRequest, NextResponse } from "next/server";
import { PropertyAvailabilityService } from "@/src/services/property-availability.service";

/**
 * GET /api/properties/[id]/availability
 *
 * Obtiene la disponibilidad de una propiedad para un rango de fechas
 *
 * Query params:
 * - startDate: YYYY-MM-DD (opcional, default: hoy)
 * - endDate: YYYY-MM-DD (opcional, default: hoy + 90 días)
 * - summary: boolean (opcional, si es true retorna solo resumen)
 *
 * Respuesta:
 * {
 *   success: boolean,
 *   data: PropertyAvailabilityDay[],
 *   meta: {
 *     propertyId: number,
 *     startDate: string,
 *     endDate: string,
 *     totalDays: number,
 *     availableDays: number,
 *     bookedDays: number,
 *     blockedDays: number
 *   }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);

    // Validar ID
    if (isNaN(propertyId) || propertyId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de propiedad inválido",
        },
        { status: 400 }
      );
    }

    // Obtener parámetros de query
    const searchParams = request.nextUrl.searchParams;
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const summaryOnly = searchParams.get("summary") === "true";

    // Defaults: hoy + 90 días
    const startDate = startDateStr ? new Date(startDateStr) : new Date();

    const endDate = endDateStr
      ? new Date(endDateStr)
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    // Validar fechas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "Formato de fecha inválido. Use YYYY-MM-DD",
        },
        { status: 400 }
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        {
          success: false,
          error: "La fecha de inicio debe ser anterior a la fecha de fin",
        },
        { status: 400 }
      );
    }

    // Obtener disponibilidad
    const availability =
      await PropertyAvailabilityService.getPropertyAvailability(
        propertyId,
        startDate,
        endDate
      );

    // Calcular estadísticas
    const stats = {
      totalDays: availability.length,
      availableDays: availability.filter((d) => d.available).length,
      bookedDays: availability.filter(
        (d) => !d.available && d.reason === "booked"
      ).length,
      blockedDays: availability.filter(
        (d) => !d.available && d.reason === "blocked"
      ).length,
      maintenanceDays: availability.filter(
        (d) => !d.available && d.reason === "maintenance"
      ).length,
    };

    // Si solo pide resumen, retornar solo stats
    if (summaryOnly) {
      return NextResponse.json({
        success: true,
        data: stats,
        meta: {
          propertyId,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
      });
    }

    // Respuesta completa
    return NextResponse.json({
      success: true,
      data: availability,
      meta: {
        propertyId,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        ...stats,
      },
    });
  } catch (error) {
    console.error("❌ Error en /api/properties/[id]/availability:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/properties/[id]/availability/check
 *
 * Verifica si un rango específico de fechas está disponible
 * Útil para validar antes de iniciar una reserva
 *
 * Body:
 * {
 *   checkinDate: "YYYY-MM-DD",
 *   checkoutDate: "YYYY-MM-DD"
 * }
 *
 * Respuesta:
 * {
 *   success: boolean,
 *   available: boolean,
 *   message: string
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);

    if (isNaN(propertyId) || propertyId <= 0) {
      return NextResponse.json(
        { success: false, error: "ID de propiedad inválido" },
        { status: 400 }
      );
    }

    // Parsear body
    const body = await request.json();
    const { checkinDate, checkoutDate } = body;

    if (!checkinDate || !checkoutDate) {
      return NextResponse.json(
        {
          success: false,
          error: "Debe proporcionar checkinDate y checkoutDate",
        },
        { status: 400 }
      );
    }

    const checkin = new Date(checkinDate);
    const checkout = new Date(checkoutDate);

    if (isNaN(checkin.getTime()) || isNaN(checkout.getTime())) {
      return NextResponse.json(
        { success: false, error: "Formato de fecha inválido" },
        { status: 400 }
      );
    }

    if (checkin >= checkout) {
      return NextResponse.json(
        {
          success: false,
          error: "La fecha de check-in debe ser anterior al check-out",
        },
        { status: 400 }
      );
    }

    // Verificar disponibilidad
    const isAvailable = await PropertyAvailabilityService.isRangeAvailable(
      propertyId,
      checkin,
      checkout
    );

    return NextResponse.json({
      success: true,
      available: isAvailable,
      message: isAvailable
        ? "Las fechas están disponibles"
        : "Algunas fechas no están disponibles",
      checkinDate,
      checkoutDate,
    });
  } catch (error) {
    console.error("❌ Error verificando disponibilidad:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al verificar disponibilidad",
      },
      { status: 500 }
    );
  }
}
