import { NextRequest, NextResponse } from "next/server";
import { PropertyService } from "@/src/services/property.service";

// GET /api/host/:hostId/properties
// Devuelve listado de propiedades del host usando FN_GET_PROPERTIES_BY_HOST
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ hostId: string }> }
) {
  try {
    const { hostId } = await context.params;

    if (!hostId) {
      return NextResponse.json(
        { error: "Falta parámetro hostId" },
        { status: 400 }
      );
    }

    const hostIdNum = Number(hostId);
    if (Number.isNaN(hostIdNum) || hostIdNum <= 0) {
      return NextResponse.json({ error: "hostId inválido" }, { status: 400 });
    }

    // Llamar al servicio Oracle
    const properties = await PropertyService.getPropertyByHost(hostIdNum);

    return NextResponse.json(
      { success: true, data: properties },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en GET /api/host/[hostId]/properties:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener las propiedades del host" },
      { status: 500 }
    );
  }
}
