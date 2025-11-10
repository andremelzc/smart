import { NextRequest, NextResponse } from 'next/server';
import { PropertyService } from '@/src/services/property.service';
import type {
  UpdatePropertyBody,
  PropertyErrorResponse
} from '@/src/types/dtos/properties.dto';

interface PropertyEditResponse {
  success: true;
  data: UpdatePropertyBody;
}

/**
 * GET /api/properties/:id/edit
 * Obtener los datos de una propiedad para el formulario de edición
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<PropertyEditResponse | PropertyErrorResponse>> {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);

    // Validar que el ID sea un número válido
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: 'ID de propiedad inválido' },
        { status: 400 }
      );
    }

    // Llamar al servicio para obtener los datos de la propiedad
    const propertyData = await PropertyService.getPropertyForEdit(propertyId);

    return NextResponse.json({
      success: true,
      data: propertyData
    });

  } catch (error) {
    console.error('Error al obtener la propiedad para edición:', error);

    // Si es un error conocido del servicio
    if (error instanceof Error) {
      // Verificar si es el error de "Propiedad no encontrada"
      if (error.message.includes('Propiedad no encontrada')) {
        return NextResponse.json(
          { error: 'Propiedad no encontrada' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
