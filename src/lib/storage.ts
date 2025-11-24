import { Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";

const BUCKET_NAME = process.env.GCS_BUCKET_NAME;

let storageInstance: Storage | null = null;

function getStorageInstance(): Storage {
  if (storageInstance) {
    return storageInstance;
  }

  const base64Key = process.env.GCS_SERVICE_KEY_BASE64;

  if (!base64Key) {
    throw new Error("Falta la variable de entorno GCS_SERVICE_KEY_BASE64.");
  }

  // Decodificar cadena
  const rawCredentials = Buffer.from(base64Key, "base64").toString("utf-8");
  const credentials = JSON.parse(rawCredentials);

  // Configuración cliente GCS
  storageInstance = new Storage({
    credentials: credentials,
  });

  return storageInstance;
}

export async function uploadFileToStorage(
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error("Falta la variable de entorno GCS_BUCKET_NAME.");
  }

  const storage = getStorageInstance();

  // generar nombre
  const fileExtension = mimeType.split("/")[1] || "jpg";
  const uniqueId = uuidv4();
  // ruta dentro del bucket
  const destinationPath = `recintos/${uniqueId}.${fileExtension}`;

  const bucket = storage.bucket(BUCKET_NAME);
  const file = bucket.file(destinationPath);

  const uploadOptions = {
    metadata: {
      contentType: mimeType,
      cacheControl: "public, max-age=31536000", // cache por 1 año
    },
    //predefinedAcl: 'publicRead' as const, // hacer el archivo público
  };

  try {
    //subir al bucket
    await file.save(fileBuffer, uploadOptions);
    // url publica
    const fileUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${destinationPath}`;
    return fileUrl;
  } catch (error) {
    console.log("Error al subir el archivo a GCS:", error);
    throw new Error(
      "Error al subir el archivo a GCS: " + (error as Error).message
    );
  }
}
