import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { CollapsibleSection } from "./CollapsibleSection";
import type { AmenityCategory } from "./types";

type AmenitiesSelectorProps = {
  categories: AmenityCategory[];
  selectedAmenities: number[];
  loading: boolean;
  error: string | null;
  onToggle: (id: number) => void;
};

export function AmenitiesSelector({
  categories,
  selectedAmenities,
  loading,
  error,
  onToggle,
}: AmenitiesSelectorProps) {
  const initialOpenMap = useMemo(() => {
    if (categories.length === 0) return {};

    const map: Record<number, boolean> = {};
    categories.forEach((category, index) => {
      map[category.id] = index === 0;
    });
    return map;
  }, [categories]);

  const [openMap, setOpenMap] =
    useState<Record<string | number, boolean>>(initialOpenMap);

  useEffect(() => {
    setOpenMap(initialOpenMap);
  }, [initialOpenMap]);

  const sortedCategories = useMemo(() => {
    return categories
      .map((category) => ({
        ...category,
        amenities: [...category.amenities].sort((a, b) =>
          a.label.localeCompare(b.label, "es", { sensitivity: "base" })
        ),
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, "es", { sensitivity: "base" })
      );
  }, [categories]);

  const handleCategoryToggle = (id: string | number) => {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <span className="text-gray-dark-500 flex items-center gap-2 text-sm">
        <Loader2 className="text-blue-light-500 h-4 w-4 animate-spin" />
        Cargando amenities...
      </span>
    );
  }

  if (!loading && sortedCategories.length === 0) {
    return (
      <span className="text-gray-dark-500 text-sm">
        No hay amenities disponibles.
      </span>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {sortedCategories.map((category) => {
        const isOpen = openMap[category.id] ?? false;

        return (
          <CollapsibleSection
            key={category.id}
            id={category.id}
            title={category.name}
            isOpen={isOpen}
            onToggle={handleCategoryToggle}
          >
            <div className="flex flex-wrap gap-2">
              {category.amenities.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity.id);

                return (
                  <button
                    type="button"
                    key={amenity.id}
                    title={amenity.label}
                    onClick={() => onToggle(amenity.id)}
                    className={`flex flex-1 basis-32 items-center justify-center rounded-full px-3 py-2 text-center text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-blue-vivid-500 text-white shadow-md"
                        : "border-blue-light-200 bg-blue-light-50 text-blue-light-700 hover:border-blue-light-300 border"
                    }`}
                  >
                    <span className="max-w-full truncate whitespace-nowrap">
                      {amenity.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </CollapsibleSection>
        );
      })}
    </div>
  );
}
