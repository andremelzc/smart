import { NextResponse } from "next/server";
import { PropertyFilterService } from "@/src/services/property-filter.service";
import { PropertyFilterDto } from "@/src/types/dtos/properties.dto";

export async function GET() {
  // 🧩 Filtros de ejemplo (puedes luego recibirlos dinámicamente desde query o body)
  const sampleFilters: PropertyFilterDto = {
    city: "Lima",
    minPrice: 100,
    maxPrice: 500,
    rooms: 1,
    beds: 1,
    baths: 1,
    adults: 2,
    children: 1,
    babies: 0,
    pets: 0,
    startDate: "2025-11-01",
    endDate: "2025-11-05",
    latMin: -12.3,
    latMax: -11.9,
    lngMin: -77.2,
    lngMax: -76.9,
    amenities: [53, 54],
  };

  try {
    const results = await PropertyFilterService.searchProperties(sampleFilters);

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error: unknown) {
    console.error("❌ Error en GET /api/properties/search:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
/**
 * Endpoint que recibe los filtros del frontend
 * y devuelve las propiedades filtradas desde Oracle.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parseOptionalNumber = (value: unknown): number | undefined => {
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
      return undefined;
    };

    // Normaliza los filtros para mantener tipos consistentes
    const filters: PropertyFilterDto = {
      city: typeof body.city === "string" ? body.city : undefined,
      minPrice: parseOptionalNumber(body.minPrice),
      maxPrice: parseOptionalNumber(body.maxPrice),
      rooms: parseOptionalNumber(body.rooms),
      beds: parseOptionalNumber(body.beds),
      baths: parseOptionalNumber(body.baths),
      latMin: parseOptionalNumber(body.latMin),
      latMax: parseOptionalNumber(body.latMax),
      lngMin: parseOptionalNumber(body.lngMin),
      lngMax: parseOptionalNumber(body.lngMax),
      startDate:
        typeof body.startDate === "string" ? body.startDate : undefined,
      endDate: typeof body.endDate === "string" ? body.endDate : undefined,
      adults: parseOptionalNumber(body.adults),
      children: parseOptionalNumber(body.children),
      babies: parseOptionalNumber(body.babies),
      pets: parseOptionalNumber(body.pets),
      amenities: Array.isArray(body.amenities)
        ? body.amenities
            .map((value: unknown) => Number(value))
            .filter((value: number) => Number.isFinite(value))
        : undefined,
      orderBy: (() => {
        const raw = Array.isArray(body.orderBy)
          ? body.orderBy[0]
          : body.orderBy;
        if (typeof raw !== "string") {
          return undefined;
        }
        const normalized = raw.trim().toLowerCase();
        return normalized === "price" || normalized === "rating"
          ? normalized
          : undefined;
      })(),
    };

    // Ejemplo de logs para debugging (puedes quitar en producción)
    console.log("📨 Filtros recibidos:", filters);

    const results = await PropertyFilterService.searchProperties(filters);

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error: unknown) {
    console.error("❌ Error en /api/properties/search:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

// ✅ Ruta temporal GET (solo para probar pegando en navegador)
// export async function GET() {
//   const sampleBody = {
//     city: "Lima",
//     minPrice: 100,
//     maxPrice: 500,
//     rooms: 1,
//     beds: 1,
//     baths: 1,
//     latMin: -12.3,
//     latMax: -11.9,
//     lngMin: -77.2,
//     lngMax: -76.9,
//     amenities: [53, 54]
//   };

//   try {
//     const results = await PropertyFilterService.searchProperties(sampleBody);
//     return NextResponse.json({ success: true, count: results.length, data: results });
//   } catch (error: any) {
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// }
