import { NextResponse } from 'next/server';
import { executeQuery } from '@/src/lib/database';

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
    const rows = (result.rows ?? []).map((r: any) => ({
      ciudad: r.CIUDAD ?? r.ciudad ?? r.CITY ?? r.city,
      pais: r.PAIS ?? r.pais ?? r.COUNTRY ?? r.country,
      property_count: Number(r.PROPERTY_COUNT ?? r.property_count ?? 0),
    }));

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ success: false, message: error?.message ?? String(error) }, { status: 500 });
  }
}
