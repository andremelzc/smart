import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { PropertyService } from "@/src/services/property.service";
import { uploadFileToStorage } from "@/src/lib/storage";
import type { PropertyDetail } from "@/src/types/dtos/properties.dto";

interface PropertyCreateResponse {
  success: true;
  data: {
    propertyId: number;
  };
}

interface PropertyErrorResponse {
  error: string;
  details?: string;
}

/**
 * POST /api/properties
 * Crear una nueva propiedad
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<PropertyCreateResponse | PropertyErrorResponse>> {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    // CAMPOS OBLIGATORIOS
    const title = formData.get("title") as string;
    const propertyType = formData.get("propertyType") as string;
    const basePriceNightStr = formData.get("basePriceNight") as string;
    const addressText = formData.get("addressText") as string;
    const city = formData.get("city") as string;
    const stateRegion = formData.get("stateRegion") as string;
    const country = formData.get("country") as string;
    const latitudeStr = formData.get("latitude") as string;
    const longitudeStr = formData.get("longitude") as string;
    const descriptionLong = formData.get("descriptionLong") as string;
    const houseRules = formData.get("houseRules") as string;
    const checkinTime = formData.get("checkinTime") as string;
    const checkoutTime = formData.get("checkoutTime") as string;
    const capacityStr = formData.get("capacity") as string;
    const bedroomsStr = formData.get("bedrooms") as string;
    const bathroomsStr = formData.get("bathrooms") as string;
    const bedsStr = formData.get("beds") as string;

    // CAMPOS OPCIONALES
    const currencyCode = formData.get("currencyCode") as string;
    const postalCode = formData.get("postalCode") as string;
    const areaStr = formData.get("area") as string;
    const floorNumberStr = formData.get("floorNumber") as string;
    const maxAdultsStr = formData.get("maxAdults") as string;
    const maxChildrenStr = formData.get("maxChildren") as string;
    const maxBabyStr = formData.get("maxBaby") as string;
    const maxPetsStr = formData.get("maxPets") as string;

    // Validar campos obligatorios
    if (
      !title ||
      !propertyType ||
      !basePriceNightStr ||
      !addressText ||
      !city ||
      !stateRegion ||
      !country ||
      !latitudeStr ||
      !longitudeStr ||
      !descriptionLong ||
      !houseRules ||
      !checkinTime ||
      !checkoutTime ||
      !capacityStr ||
      !bedroomsStr ||
      !bathroomsStr ||
      !bedsStr
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Convertir campos numéricos obligatorios
    const basePriceNight = parseFloat(basePriceNightStr);
    const latitude = parseFloat(latitudeStr);
    const longitude = parseFloat(longitudeStr);
    const capacity = parseInt(capacityStr, 10);
    const bedrooms = parseInt(bedroomsStr, 10);
    const bathrooms = parseInt(bathroomsStr, 10);
    const beds = parseInt(bedsStr, 10);

    // Validar conversiones de campos obligatorios
    if (
      isNaN(basePriceNight) ||
      isNaN(latitude) ||
      isNaN(longitude) ||
      isNaN(capacity) ||
      isNaN(bedrooms) ||
      isNaN(bathrooms) ||
      isNaN(beds)
    ) {
      return NextResponse.json(
        { error: "Campos numéricos obligatorios inválidos" },
        { status: 400 }
      );
    }

    // Convertir campos numéricos opcionales
    const area = areaStr ? parseFloat(areaStr) : undefined;
    const floorNumber = floorNumberStr ? parseInt(floorNumberStr, 10) : undefined;
    const maxAdults = maxAdultsStr ? parseInt(maxAdultsStr, 10) : undefined;
    const maxChildren = maxChildrenStr ? parseInt(maxChildrenStr, 10) : undefined;
    const maxBaby = maxBabyStr ? parseInt(maxBabyStr, 10) : undefined;
    const maxPets = maxPetsStr ? parseInt(maxPetsStr, 10) : undefined;

    // Validar conversiones de campos opcionales
    if (
      (areaStr && isNaN(area!)) ||
      (floorNumberStr && isNaN(floorNumber!)) ||
      (maxAdultsStr && isNaN(maxAdults!)) ||
      (maxChildrenStr && isNaN(maxChildren!)) ||
      (maxBabyStr && isNaN(maxBaby!)) ||
      (maxPetsStr && isNaN(maxPets!))
    ) {
      return NextResponse.json(
        { error: "Campos numéricos opcionales inválidos" },
        { status: 400 }
      );
    }

    // Procesar y subir imágenes a GCP
    const photoFiles = formData.getAll("photos");
    const images: Array<{ url: string; caption?: string }> = [];
    
    if (photoFiles && photoFiles.length > 0) {
      for (let i = 0; i < photoFiles.length; i++) {
        const fileEntry = photoFiles[i];
        
        if (!(fileEntry instanceof File)) {
          console.warn(`Entrada ${i} no es un archivo, se omite`);
          continue;
        }

        const file = fileEntry as File;
        
        try {
          // Convertir el archivo a buffer
          const buffer = Buffer.from(await file.arrayBuffer());
          const mimeType = file.type;

          // Subir a GCP Storage
          const photoUrl = await uploadFileToStorage(buffer, mimeType);
          
          // Obtener el caption si existe (puede venir como captions[0], captions[1], etc.)
          const captionKey = `captions[${i}]`;
          const caption = formData.get(captionKey) as string || file.name;

          images.push({
            url: photoUrl,
            caption: caption,
          });
        } catch (uploadError) {
          console.error(`Error al subir imagen ${i}:`, uploadError);
          return NextResponse.json(
            { 
              error: "Error al subir imágenes a GCP",
              details: uploadError instanceof Error ? uploadError.message : "Error desconocido"
            },
            { status: 500 }
          );
        }
      }
    }

    // Validar que se hayan subido al menos una imagen
    if (images.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos una imagen de la propiedad" },
        { status: 400 }
      );
    }

    // Procesar amenities
    const amenitiesJson = formData.get("amenities") as string;
    let amenities: Array<{ code: string; name?: string }> = [];
    if (amenitiesJson) {
      try {
        amenities = JSON.parse(amenitiesJson);
      } catch (error) {
        console.error("Error al parsear amenities:", error);
        return NextResponse.json(
          { error: "Formato de amenities inválido" },
          { status: 400 }
        );
      }
    }

    // Construir el objeto PropertyDetail
    const propertyData: Partial<PropertyDetail> = {
      title,
      propertyType,
      basePriceNight,
      currencyCode: currencyCode || "USD",
      addressText,
      city,
      stateRegion,
      country,
      postalCode: postalCode || undefined,
      latitude,
      longitude,
      descriptionLong,
      houseRules,
      checkinTime,
      checkoutTime,
      capacity,
      bedrooms,
      bathrooms,
      beds,
      area,
      floorNumber,
      maxAdults,
      maxChildren,
      maxBaby,
      maxPets,
      images: images as any,
      amenities: amenities as any,
    };

    // Llamar al servicio para crear la propiedad
    const result = await PropertyService.createProperty(
      parseInt(session.user.id),
      propertyData
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error al crear la propiedad:", error);

    // Si es un error conocido del servicio
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
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
