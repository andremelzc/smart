"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CityHighlight } from '@/src/services/home-highlights.service';

const FALLBACK_IMAGES = [
  'bg-gradient-to-br from-blue-light-200 via-blue-light-100 to-blue-light-300',
  'bg-gradient-to-br from-blue-vivid-400 via-blue-vivid-200 to-blue-light-200',
  'bg-gradient-to-br from-blue-light-300 via-white to-blue-light-200',
];

const getFallbackClass = (index: number) => FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

const formatRating = (value: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  if (value % 1 === 0) {
    return value.toFixed(0);
  }
  if (Math.abs(value * 10 - Math.round(value * 10)) < 1e-6) {
    return value.toFixed(1);
  }
  return value.toFixed(2);
};

const VISIBLE_COUNT = 4;
const CAROUSEL_INTERVAL_MS = 5000;

export function CityCarousel({ city, country, properties }: CityHighlight) {
  const total = properties.length;
  const visibleCount = Math.min(VISIBLE_COUNT, total);
  const shouldRotate = total > visibleCount;
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const goToNext = useCallback(() => {
    setCurrentIndex((previous) => {
      if (total <= 0) {
        return 0;
      }
      return (previous + 1) % total;
    });
  }, [total]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((previous) => {
      if (total <= 0) {
        return 0;
      }
      return (previous - 1 + total) % total;
    });
  }, [total]);

  const clearRotation = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startRotation = useCallback(() => {
    if (!shouldRotate) {
      return;
    }
    clearRotation();
    intervalRef.current = window.setInterval(() => {
      goToNext();
    }, CAROUSEL_INTERVAL_MS);
  }, [clearRotation, goToNext, shouldRotate]);

  useEffect(() => {
    startRotation();
    return () => {
      clearRotation();
    };
  }, [clearRotation, startRotation]);

  const displayItems = useMemo(() => {
    if (total === 0) {
      return [] as Array<{ property: CityHighlight['properties'][number]; sourceIndex: number }>;
    }

    if (!shouldRotate) {
      return properties.map((property, index) => ({ property, sourceIndex: index }));
    }

    const normalizedIndex = ((currentIndex % total) + total) % total;

    return Array.from({ length: visibleCount }, (_, offset) => {
      const sourceIndex = (normalizedIndex + offset) % total;
      const property = properties[sourceIndex];
      return { property, sourceIndex };
    });
  }, [currentIndex, properties, shouldRotate, total, visibleCount]);

  const getItemKey = (property: CityHighlight['properties'][number], sourceIndex: number) => {
    const idPart = typeof property.propertyId === 'number' || typeof property.propertyId === 'string'
      ? String(property.propertyId)
      : 'prop';
    return `${city}-${sourceIndex}-${idPart}`;
  };

  const handleNextClick = () => {
    goToNext();
    startRotation();
  };

  const handlePreviousClick = () => {
    goToPrevious();
    startRotation();
  };

  const handlePause = () => {
    clearRotation();
  };

  const handleResume = () => {
    startRotation();
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-dark-800">{city}</h2>
          {country && <p className="text-sm text-gray-dark-500">Explora estancias destacadas en {country}</p>}
        </div>
        <Link href={`/search?city=${encodeURIComponent(city)}`} className="text-sm font-semibold text-blue-light-600 hover:underline">
          Ver todo
        </Link>
      </div>
      <div
        className="relative px-6"
        onMouseEnter={handlePause}
        onMouseLeave={handleResume}
      >
        <div className="grid grid-flow-col auto-cols-[minmax(16rem,18rem)] gap-4 overflow-hidden pb-2">
        {displayItems.map(({ property, sourceIndex }) => {
          const ratingLabel = formatRating(property.averageRating ?? null);
          const propertyUrl = `/properties/${property.propertyId}`;

          return (
            <Link
                key={getItemKey(property, sourceIndex)}
              href={propertyUrl}
              className="relative flex h-full flex-col gap-3 rounded-3xl bg-white shadow-[0_8px_30px_rgb(31_41_55_/_12%)] transition-transform hover:-translate-y-1"
            >
              <div className="relative h-40 w-full overflow-hidden rounded-3xl">
                {property.mainImageUrl ? (
                  <Image
                    src={property.mainImageUrl}
                    alt={property.title}
                    fill
                    sizes="(max-width: 1280px) 50vw, 25vw"
                    className="object-cover"
                    priority={sourceIndex < visibleCount}
                  />
                ) : (
                  <div className={`h-full w-full ${getFallbackClass(sourceIndex)} blur-[0.3px]`} />
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
                <div className="flex items-center justify-between text-sm text-gray-dark-500">
                  <span className="font-medium text-gray-dark-700">{property.city}</span>
                  {ratingLabel && (
                    <span className="flex items-center gap-1 font-semibold text-gray-dark-700">
                      <span aria-hidden>★</span>
                      {ratingLabel}
                    </span>
                  )}
                </div>
                <p className="text-base font-semibold text-gray-dark-800 line-clamp-2">{property.title}</p>
              </div>
            </Link>
          );
        })}
      </div>
        {shouldRotate && (
          <>
            <button
              type="button"
              onClick={handlePreviousClick}
              className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-blue-light-200 bg-white/90 p-2 text-gray-dark-600 shadow-sm transition hover:border-blue-light-300 hover:text-blue-light-600"
              aria-label="Ver propiedad anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNextClick}
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-blue-light-200 bg-white/90 p-2 text-gray-dark-600 shadow-sm transition hover:border-blue-light-300 hover:text-blue-light-600"
              aria-label="Ver siguiente propiedad"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
