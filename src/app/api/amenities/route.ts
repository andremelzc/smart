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
};

export async function GET() {
  const sql = `
    SELECT a.AMENITY_ID AS id,
           a.NAME AS label
    FROM AMENITIES a
    ORDER BY a.NAME
  `;

  try {
  const result = await executeQuery(sql);
  const rows = ((result.rows ?? []) as AmenityRow[]).map((row) => {
      const id = Number(
        row.ID ?? row.id ?? row.AMENITY_ID ?? row.amenity_id ?? 0,
      );

      const label = (
        row.LABEL ?? row.label ?? row.NAME ?? row.name ?? ''
      ).toString();

      return {
        id,
        label,
      };
    }).filter((item) => Number.isInteger(item.id) && item.id > 0 && item.label.length > 0);

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Error fetching amenities:', error);
    return NextResponse.json(
      { success: false, message: error?.message ?? String(error) },
      { status: 500 },
    );
  }
}
