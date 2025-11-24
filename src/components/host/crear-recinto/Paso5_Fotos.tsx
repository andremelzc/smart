"use client";

// src/components/host/crear-recinto/Paso5_Fotos.tsx

import { StepHeader } from "./StepHeader";
import { UploadCloud, Trash2, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import Image from "next/image";

interface ImageData {
  url: string;
  caption: string;
  sortOrder: number;
}

interface StepProps {
  data: {
    images: ImageData[];
  };
  updateData: (data: Partial<StepProps["data"]>) => void;
}

export function Paso5_Fotos({ data, updateData }: StepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDropzoneClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    setUploadProgress(0);

    const newImagesArray = [...data.images];
    const totalFiles = files.length;
    let processedFiles = 0;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (readEvent) => {
        const newImage: ImageData = {
          url: readEvent.target?.result as string,
          caption: file.name,
          sortOrder: data.images.length + index + 1,
        };

        newImagesArray.push(newImage);
        processedFiles++;

        // Actualizar progreso
        setUploadProgress(Math.round((processedFiles / totalFiles) * 100));

        if (processedFiles === totalFiles) {
          updateData({ images: newImagesArray });
          // Pequeño delay para que se vea el 100%
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 300);
        }
      };

      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = "";
  };

  const handleRemoveImage = (urlToRemove: string) => {
    const filteredImages = data.images.filter((img) => img.url !== urlToRemove);
    const updatedImages = filteredImages.map((img, index) => ({
      ...img,
      sortOrder: index + 1,
    }));

    updateData({ images: updatedImages });
  };

  return (
    <div className="flex flex-col gap-6">
      <StepHeader
        title="¡Muestra tu recinto!"
        subtitle="Sube al menos una foto para continuar. Una buena primera foto es clave."
        helpText="Puedes seleccionar varias fotos a la vez. La primera que subas será tu foto de portada."
      />

      <div
        onClick={handleDropzoneClick}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all ${
          isUploading
            ? "cursor-wait border-blue-400 bg-blue-50"
            : "cursor-pointer border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <span className="mt-3 text-base font-semibold text-blue-600">
              Subiendo fotos... {uploadProgress}%
            </span>
            <div className="mt-2 h-2 w-48 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <UploadCloud className="h-12 w-12 text-slate-600" />
            <span className="mt-3 text-base font-semibold text-slate-600">
              Haz clic para subir tus fotos
            </span>
            <span className="mt-1 text-xs text-slate-500">(PNG, JPG)</span>
          </>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*"
        className="hidden"
      />

      {data.images.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-base font-semibold text-slate-800">
            Tus fotos ({data.images.length})
          </h3>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {data.images.map((image) => (
              <div
                key={image.sortOrder}
                className="group relative aspect-video overflow-hidden rounded-lg border border-slate-200 shadow-sm"
              >
                <Image
                  src={image.url || "/placeholder-room.svg"}
                  alt={image.caption || "Imagen del recinto"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />

                {image.sortOrder === 1 && (
                  <span className="absolute top-2 left-2 rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white shadow-md">
                    Portada
                  </span>
                )}

                <button
                  onClick={() => handleRemoveImage(image.url)}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
                  aria-label="Eliminar foto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.images.length === 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
          <p className="text-sm font-medium text-red-700">
            ¡Necesitas subir al menos 1 foto para poder continuar!
          </p>
        </div>
      )}
    </div>
  );
}
