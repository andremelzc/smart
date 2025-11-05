import { NextResponse } from 'next/server';
import { executeQuery } from '@/src/lib/database';

type LocationRow = {
  CIUDAD?: unknown;
  ciudad?: unknown;
  CITY?: unknown;
  city?: unknown;
  PAIS?: unknown;
  pais?: unknown;
  COUNTRY?: unknown;
  country?: unknown;
  PROPERTY_COUNT?: unknown;
  property_count?: unknown;
};

const toText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
};

const toNumber = (value: unknown): number => {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export async function GET() {
  const sql = `
    SELECT CITY AS ciudad,
           p.COUNTRY AS pais,
           COUNT(*) AS property_count
    FROM PROPERTIES p
    JOIN BOOKINGS b ON p.PROPERTY_ID = b.PROPERTY_ID
    GROUP BY CITY, COUNTRY
    ORDER BY property_count DESC, city ASC
    FETCH FIRST 5 ROWS ONLY
  `;

  try {
    const result = await executeQuery(sql);
    const rows = ((result.rows ?? []) as LocationRow[]).map((row) => ({
      ciudad: toText(row.CIUDAD ?? row.ciudad ?? row.CITY ?? row.city),
      pais: toText(row.PAIS ?? row.pais ?? row.COUNTRY ?? row.country),
      property_count: toNumber(row.PROPERTY_COUNT ?? row.property_count ?? 0),
    }));

    return NextResponse.json({ success: true, data: rows });
  } catch (error: unknown) {
    console.error('Error fetching locations:', error);
    const message = error instanceof Error ? error.message : 'No se pudo obtener las ubicaciones.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
