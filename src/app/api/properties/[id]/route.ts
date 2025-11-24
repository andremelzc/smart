import { NextRequest, NextResponse } from "next/server";
import { PropertyService } from "@/src/services/property.service";
import type {
  UpdatePropertyBody,
  UpdatePropertyResponse,
  PropertyErrorResponse,
  PropertyDetailResponse,
} from "@/src/types/dtos/properties.dto";

/**
 * GET /api/properties/:id
 * Obtener una propiedad específica con todos los detalles para reserva
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<PropertyDetailResponse | PropertyErrorResponse>> {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);

    // Validar que el ID sea un número válido
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: "ID de propiedad inválido" },
        { status: 400 }
      );
    }

    // Llamar al servicio para obtener la propiedad
    const propertyDetail = await PropertyService.getPropertyById(propertyId);

    return NextResponse.json({
      success: true,
      data: propertyDetail,
    });
  } catch (error) {
    console.error("Error al obtener la propiedad:", error);

    // Si es un error conocido del servicio
    if (error instanceof Error) {
      // Verificar si es el error de "Propiedad no encontrada"
      if (error.message.includes("Propiedad no encontrada")) {
        return NextResponse.json(
          { error: "Propiedad no encontrada" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/properties/:id
 * Actualizar una propiedad existente
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<UpdatePropertyResponse | PropertyErrorResponse>> {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);

    // Validar que el ID sea un número válido
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: "ID de propiedad inválido" },
        { status: 400 }
      );
    }

    // Parsear el body del request
    const body: UpdatePropertyBody = await request.json();

    // Llamar al servicio para actualizar la propiedad
    await PropertyService.updateProperty(propertyId, body);

    // Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: "Propiedad actualizada exitosamente",
        propertyId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar la propiedad:", error);

    // Si es un error conocido del SP
    if (error instanceof Error) {
      // Verificar si es el error de "Propiedad no encontrada"
      if (error.message.includes("Propiedad no encontrada")) {
        return NextResponse.json(
          {
            error: "Propiedad no encontrada",
            details: error.message,
          },
          { status: 404 }
        );
      }

      // Otros errores de negocio
      return NextResponse.json(
        {
          error: "Error al actualizar la propiedad",
          details: error.message,
        },
        { status: 400 }
      );
    }

    // Error genérico del servidor
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: "Ocurrió un error inesperado",
      },
      { status: 500 }
    );
  }
}
