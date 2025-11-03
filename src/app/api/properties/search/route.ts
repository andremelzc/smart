import { NextResponse } from 'next/server';
import { PropertyFilterService } from '@/src/services/property-filter.service';
import { PropertyFilterDto } from '@/src/types/dtos/properties.dto';

export async function GET() {
  // 🧩 Filtros de ejemplo (puedes luego recibirlos dinámicamente desde query o body)
  const sampleFilters: PropertyFilterDto = {
    city: "Lima",
    minPrice: 100,
    maxPrice: 500,
    rooms: 1,
    beds: 1,
    baths: 1,
    capacityTotal: 2,
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

  } catch (error: any) {
    console.error('❌ Error en GET /api/properties/search:', error);
    return NextResponse.json(
      { success: false, message: error.message },
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

    // Normaliza los filtros para mantener tipos consistentes
    const filters: PropertyFilterDto = {
      ...body,
      amenities: Array.isArray(body.amenities)
        ? body.amenities
            .map((value: unknown) => Number(value))
            .filter((value: number) => Number.isFinite(value))
        : undefined,
    };

    // Ejemplo de logs para debugging (puedes quitar en producción)
    console.log("📨 Filtros recibidos:", filters);

    const results = await PropertyFilterService.searchProperties(filters);

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error: any) {
    console.error('❌ Error en /api/properties/search:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error interno del servidor' },
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