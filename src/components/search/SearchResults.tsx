import type { ComponentType } from "react";
import { Loader2 } from "lucide-react";

import { PropertySearchCard } from "@/src/components/features/properties/PropertySearchCard";
import type { MapBounds } from "@/src/components/features/properties/PropertySearchMap";
import type { PropertyFilterDto } from "@/src/types/dtos/properties.dto";

export type MapRenderer = ComponentType<{
  items: Record<string, unknown>[];
  bounds: MapBounds | null;
  loading?: boolean;
  onBoundsChange: (nextBounds: MapBounds) => void | Promise<void>;
}>;

type SearchResultsProps = {
  results: Record<string, unknown>[];
  loading: boolean;
  error: string | null;
  showFilters: boolean;
  mapBounds: MapBounds | null;
  onBoundsChange: (nextBounds: MapBounds) => void | Promise<void>;
  appliedFilters: PropertyFilterDto | null;
  nightsCount: number | null;
  MapComponent: MapRenderer;
};

export function SearchResults({
  results,
  loading,
  error,
  showFilters,
  mapBounds,
  onBoundsChange,
  appliedFilters,
  nightsCount,
  MapComponent,
}: SearchResultsProps) {
  const startDate = appliedFilters?.startDate;
  const endDate = appliedFilters?.endDate;

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-gray-dark-700 text-xl font-semibold">Resultados</h2>

        {loading && (
          <Loader2 className="text-blue-light-500 h-5 w-5 animate-spin" />
        )}
      </header>

      {error && !showFilters && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)] lg:items-start">
        <div className="space-y-4">
          {!loading && results.length === 0 && !error ? (
            <p className="border-blue-light-150 bg-blue-light-50 text-gray-dark-500 rounded-2xl border px-4 py-6 text-center">
              Usa los filtros para iniciar una búsqueda.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((item, index) => (
                <PropertySearchCard
                  key={index}
                  data={item}
                  index={index}
                  startDate={startDate}
                  endDate={endDate}
                  nights={nightsCount ?? undefined}
                />
              ))}
            </div>
          )}
        </div>

        <div className="h-[320px] w-full lg:sticky lg:top-28 lg:h-[70vh]">
          <MapComponent
            items={results}
            bounds={mapBounds}
            loading={loading}
            onBoundsChange={onBoundsChange}
          />
        </div>
      </div>
    </section>
  );
}
