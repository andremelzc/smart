import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from '@/src/app/api/auth/[...nextauth]/route';
import { uploadFileToStorage } from "@/src/lib/storage";
import { PropertyService } from "@/src/services/property.service";
import { is } from "zod/locales";

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req: Request) {
    // const session = await getServerSession(authOptions);
    // if (!session || !session.user || session.user.role !== 'host') {
    //     return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    // }

    try {
        const formData = await req.formData();
        const propertyId = formData.get('propertyId') as string;
        const caption = formData.get('caption') as string || '';
        const orderStr = formData.get('order') as string || '0';
        const order = parseInt(orderStr, 10);
        if(!propertyId || isNaN(parseInt(propertyId))) {
            return NextResponse.json({ message: 'ID de recinto no válido o faltante' }, { status: 400 });
        }
        const parsedPropertyId = parseInt(propertyId);

        const files = formData.getAll('photos');
        if(!files || files.length === 0) {
            return NextResponse.json({ message: 'No se encontraron archivos para subir' }, { status: 400 });
        }
        const uploadedUrls: string[] = [];

        for (const fileEntry of files) {
            if (!(fileEntry instanceof File)) continue;
            const file = fileEntry as File;

            const buffer = Buffer.from(await file.arrayBuffer());
            const mimeType = file.type;

            const photoUrl = await uploadFileToStorage(buffer, mimeType);
            await PropertyService.persistPhotoUrl(parsedPropertyId, photoUrl, caption, order);

            uploadedUrls.push(photoUrl);
        }

        return NextResponse.json({ 
            message: `Subida exitosa: ${uploadedUrls.length} fotos procesadas.`, 
            urls: uploadedUrls 
        }, { status: 200 });
    } catch (error) {
        console.log("Error en el Route Handler (Subida/Persistencia):", error);
        return NextResponse.json(
            { message: `Error en el Route Handler. ${error instanceof Error ? error.message : "Fallo desconocido."}` }, 
            { status: 500 }
        );
    }
}