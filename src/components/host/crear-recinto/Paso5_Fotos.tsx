'use client';

// src/components/host/crear-recinto/Paso5_Fotos.tsx
import { StepHeader } from './StepHeader';
import { UploadCloud, Trash2 } from 'lucide-react';
import { useRef } from 'react'; 
import Image from 'next/image';


interface ImageData {
  url: string;
  caption: string;
  sortOrder: number;
}
interface StepProps {
  data: {
    images: ImageData[];
  };
  updateData: (data: Partial<StepProps['data']>) => void;
}

export function Paso5_Fotos({ data, updateData }: StepProps) {
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImagesArray = [...data.images];

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      
      reader.onload = (readEvent) => {
        const newImage: ImageData = {
          url: readEvent.target?.result as string,
          caption: file.name, 
          sortOrder: data.images.length + index + 1
        };
        
        newImagesArray.push(newImage);

        if (index === files.length - 1) {
          updateData({ images: newImagesArray });
        }
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (urlToRemove: string) => {
    const filteredImages = data.images.filter(img => img.url !== urlToRemove);
    const updatedImages = filteredImages.map((img, index) => ({
      ...img,
      sortOrder: index + 1
    }));
    updateData({ images: updatedImages });
  };

  return (
    <div className="flex flex-col gap-8">
      
      <StepHeader
        title="¡Muestra tu recinto!"
        subtitle="Sube al menos una foto para continuar. Una buena primera foto es clave."
        helpText="Puedes seleccionar varias fotos a la vez. La primera que subas será tu foto de portada."
      />

      <div
        onClick={handleDropzoneClick}
        className="flex flex-col items-center justify-center p-12 border-2 
                   border-dashed border-blue-light-300 rounded-2xl
                   bg-blue-light-50 text-blue-light-700 cursor-pointer
                   transition-all hover:bg-blue-light-100 hover:border-blue-light-400"
      >
        <UploadCloud className="w-16 h-16" />
        <span className="mt-4 text-xl font-semibold">
          Haz clic para subir tus fotos
        </span>
        <span className="mt-1 text-sm">
          (PNG, JPG)
        </span>
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
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-semibold text-gray-dark-800">
            Tus fotos ({data.images.length})
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.images.map((image) => (
              <div 
                key={image.sortOrder} 
                className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 group shadow-sm"
              >
                <Image
                  src={image.url || '/placeholder-room.svg'}
                  alt={image.caption || 'Imagen del recinto'}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
                
                {image.sortOrder === 1 && (
                  <span className="absolute top-2 left-2 bg-blue-vivid-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                    Portada
                  </span>
                )}
                
                <button
                  onClick={() => handleRemoveImage(image.url)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full 
                             bg-black/50 text-white flex items-center justify-center
                             opacity-0 group-hover:opacity-100 transition-opacity
                             hover:bg-red-500"
                  aria-label="Eliminar foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.images.length === 0 && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-center">
          <p className="text-red-700 font-medium">
            ¡Necesitas subir al menos 1 foto para poder continuar!
          </p>
        </div>
      )}

    </div>
  );
}