import { NextResponse } from 'next/server';
import { executeQuery } from '@/src/lib/database';
import { PropertyDetail } from '@/src/types/dtos/properties.dto';

export async function getPropertiesByHost(hostId: number): Promise<PropertyDetail[]> {
    const sql = `
        SELECT * FROM PROPERTIES
    `;
    const properties = await executeQuery(sql);
    return properties.rows as PropertyDetail[];
}