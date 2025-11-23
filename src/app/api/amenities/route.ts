import { NextResponse } from 'next/server';
import { executeQuery } from '@/src/lib/database';

type AmenityRow = {
  ID?: number;
  id?: number;
  AMENITY_ID?: number;
  amenity_id?: number;
  LABEL?: string;
  label?: string;
  NAME?: string;
  name?: string;
  CATEGORY_ID?: number;
  category_id?: number;
  ID_CATEGORIA?: number;
  id_categoria?: number;
  CATEGORY?: string;
  category?: string;
  CATEGORIA?: string;
  categoria?: string;
};

export async function GET() {
  const sql = `
    SELECT A.AMENITY_ID AS id,
           A.NAME AS label,
           AC.CATEGORY_ID AS id_categoria,
           AC.NAME AS categoria
    FROM AMENITIES A
    JOIN AMENITIES_CATEGORIES AC on A.AMENITY_CATEGORY_ID = AC.CATEGORY_ID
    ORDER BY AC.CATEGORY_ID
  `;

  try {
    const result = await executeQuery(sql);
    const rows = Array.isArray(result.rows) ? (result.rows as AmenityRow[]) : [];

    const categories = new Map<
      number,
      { id: number; name: string; amenities: { id: number; label: string }[] }
    >();

    rows.forEach((row) => {
      const amenityId = Number(
        row.ID ?? row.id ?? row.AMENITY_ID ?? row.amenity_id ?? 0,
      );

      const amenityLabelRaw = (
        row.LABEL ?? row.label ?? row.NAME ?? row.name ?? ''
      ).toString();

      const categoryId = Number(
        row.id_categoria ??
          row.ID_CATEGORIA ??
          row.CATEGORY_ID ??
          row.category_id ??
          0,
      );

      const categoryNameRaw = (
        row.categoria ??
        row.CATEGORIA ??
        row.category ??
        row.CATEGORY ??
        ''
      ).toString();

      if (
        !Number.isInteger(amenityId) ||
        amenityId <= 0 ||
        amenityLabelRaw.trim().length === 0 ||
        !Number.isInteger(categoryId) ||
        categoryId <= 0 ||
        categoryNameRaw.trim().length === 0
      ) {
        return;
      }

      const label = amenityLabelRaw.trim();
      const categoryName = categoryNameRaw.trim();

      if (!categories.has(categoryId)) {
        categories.set(categoryId, {
          id: categoryId,
          name: categoryName,
          amenities: [],
        });
      }

      categories.get(categoryId)?.amenities.push({ id: amenityId, label });
    });

    const data = Array.from(categories.values()).map((category) => ({
      ...category,
      amenities: category.amenities
        .filter(
          (amenity) =>
            Number.isInteger(amenity.id) && amenity.id > 0 && amenity.label.length > 0,
        )
        .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' })),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Error fetching amenities:', error);
    const message = error instanceof Error ? error.message : 'No se pudo obtener los amenities.';
    return NextResponse.json(
      { success: false, message },
      { status: 500 },
    );
  }
}
