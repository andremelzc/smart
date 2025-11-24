"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import Image from "next/image";

import { useState, useEffect, startTransition } from "react";

interface PropertyImage {
  url: string;

  alt?: string;
}

interface PropertyImageGalleryProps {
  images: PropertyImage[];

  title?: string;

  className?: string;
}

export function PropertyImageGallery({
  images,

  title = "Propiedad",

  className = "",
}: PropertyImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

  // Reset to first image when images change

  useEffect(() => {
    startTransition(() => {
      setCurrentImageIndex(0);
    });
  }, [images]);

  const nextImage = () => {
    if (images && images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (images && images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <div
        className={`relative h-96 overflow-hidden rounded-xl bg-gray-200 md:h-[500px] ${className}`}
      >
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-gray-500">No hay imagenes disponibles</span>
        </div>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  const imageKey = `${currentImageIndex}-${currentImage?.url ?? "placeholder"}`;

  const resolvedSrc = brokenImages[currentImageIndex]
    ? "/placeholder-room.svg"
    : currentImage?.url || "/placeholder-room.svg";

  return (
    <div
      className={`relative h-96 overflow-hidden rounded-xl bg-gray-200 md:h-[500px] ${className}`}
    >
      <Image
        key={imageKey}
        src={resolvedSrc}
        alt={currentImage?.alt || title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
        className="object-cover"
        onError={() =>
          setBrokenImages((prev) =>
            prev[currentImageIndex]
              ? prev
              : { ...prev, [currentImageIndex]: true }
          )
        }
        priority
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute top-1/2 left-4 z-10 -translate-y-1/2 transform rounded-full bg-white/80 p-2 shadow-lg transition-colors hover:bg-white"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={nextImage}
            className="absolute top-1/2 right-4 z-10 -translate-y-1/2 transform rounded-full bg-white/80 p-2 shadow-lg transition-colors hover:bg-white"
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Image indicators */}

          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 transform gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
