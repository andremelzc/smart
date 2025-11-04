'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState, startTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { usePropertySearch } from '@/src/hooks/usePropertySearch';
import type { PropertyFilterDto } from '@/src/types/dtos/properties.dto';
import { useSearchParams } from 'next/navigation';
import { PropertySearchCard } from '@/src/components/features/properties/PropertySearchCard';
import { PropertySearchMap, type MapBounds } from '@/src/components/features/properties/PropertySearchMap';

const AMENITY_OPTIONS = [
  { id: 53, label: 'Wi-Fi' },
  { id: 54, label: 'Estacionamiento' },
  { id: 55, label: 'Piscina' },
  { id: 56, label: 'Desayuno' },
  { id: 57, label: 'Aire acondicionado' },
];

const BOUNDS_TOLERANCE = 1e-5;

type FilterFormState = {
  city: string;
  startDate: string;
  endDate: string;
  capacityTotal: string;
  minPrice: string;
  maxPrice: string;
  rooms: string;
  beds: string;
  baths: string;
};

const EMPTY_FORM: FilterFormState = {
  city: '',
  startDate: '',
  endDate: '',
  capacityTotal: '',
  minPrice: '',
  maxPrice: '',
  rooms: '',
  beds: '',
  baths: '',
};

const parseNumericString = (value: string | null | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildFilters = (
  values: FilterFormState,
  amenities: number[],
  bounds: MapBounds | null,
): PropertyFilterDto => {
  const base: PropertyFilterDto = {
    city: values.city || undefined,
    startDate: values.startDate || undefined,
    endDate: values.endDate || undefined,
    capacityTotal: parseNumericString(values.capacityTotal),
    minPrice: parseNumericString(values.minPrice),
    maxPrice: parseNumericString(values.maxPrice),
    rooms: parseNumericString(values.rooms),
    beds: parseNumericString(values.beds),
    baths: parseNumericString(values.baths),
  };

  if (amenities.length > 0) {
    base.amenities = [...amenities];
  }

  if (bounds) {
    base.latMin = bounds.latMin;
    base.latMax = bounds.latMax;
    base.lngMin = bounds.lngMin;
    base.lngMax = bounds.lngMax;
  }

  return base;
};

const areBoundsEqual = (a: MapBounds | null, b: MapBounds | null) => {
  if (!a || !b) return false;
  return (
    Math.abs(a.latMin - b.latMin) < BOUNDS_TOLERANCE &&
    Math.abs(a.latMax - b.latMax) < BOUNDS_TOLERANCE &&
    Math.abs(a.lngMin - b.lngMin) < BOUNDS_TOLERANCE &&
    Math.abs(a.lngMax - b.lngMax) < BOUNDS_TOLERANCE
  );
};

export default function PropertySearchPage() {
  const { search, results, loading } = usePropertySearch();
  const searchParams = useSearchParams();
  const [formValues, setFormValues] = useState<FilterFormState>({ ...EMPTY_FORM });
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<PropertyFilterDto | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParamsKey = searchParams.toString();
  useEffect(() => {
    if (!searchParamsKey) {
      // Use startTransition to batch state updates and prevent cascading renders
      startTransition(() => {
        setFormValues({ ...EMPTY_FORM });
        setSelectedAmenities([]);
        setMapBounds(null);
        setAppliedFilters(null);
        setError(null);
      });
      return;
    }

    const params = new URLSearchParams(searchParamsKey);
    const nextForm: FilterFormState = {
      ...EMPTY_FORM,
      city: params.get('city') ?? '',
      startDate: params.get('startDate') ?? '',
      endDate: params.get('endDate') ?? '',
      capacityTotal: params.get('capacityTotal') ?? '',
      minPrice: params.get('minPrice') ?? '',
      maxPrice: params.get('maxPrice') ?? '',
      rooms: params.get('rooms') ?? '',
      beds: params.get('beds') ?? '',
      baths: params.get('baths') ?? '',
    };

    const amenityValues = params.getAll('amenities');
    const amenityTokens = amenityValues.length > 0
      ? amenityValues
      : (params.get('amenities') ?? '')
          .split(',')
          .map((token) => token.trim())
          .filter(Boolean);

    const parsedAmenityIds = amenityTokens
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0);

    const latMin = parseNumericString(params.get('latMin'));
    const latMax = parseNumericString(params.get('latMax'));
    const lngMin = parseNumericString(params.get('lngMin'));
    const lngMax = parseNumericString(params.get('lngMax'));

    const initialBounds =
      typeof latMin === 'number' &&
      typeof latMax === 'number' &&
      typeof lngMin === 'number' &&
      typeof lngMax === 'number'
        ? { latMin, latMax, lngMin, lngMax }
        : null;

    // Batch all state updates to prevent cascading renders
    startTransition(() => {
      setFormValues(nextForm);
      setSelectedAmenities(parsedAmenityIds);
      setMapBounds(initialBounds);
      setError(null);
    });

    const initialFilters = buildFilters(nextForm, parsedAmenityIds, initialBounds);

    search(initialFilters)
      .then(() => {
        setAppliedFilters({
          ...initialFilters,
          amenities: initialFilters.amenities ? [...initialFilters.amenities] : undefined,
        });
      })
      .catch((err) => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('No se pudo realizar la búsqueda.');
        }
      });
  }, [searchParamsKey, search]);

  useEffect(() => {
    const handleOpenFilters = () => setShowFilters(true);

    window.addEventListener('toggle-search-filters', handleOpenFilters);

    return () => {
      window.removeEventListener('toggle-search-filters', handleOpenFilters);
    };
  }, []);

  useEffect(() => {
    if (!showFilters) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowFilters(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [showFilters]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (id: number) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((amenityId) => amenityId !== id) : [...prev, id],
    );
  };

  const nightsCount = useMemo(() => {
    if (!appliedFilters?.startDate || !appliedFilters?.endDate) {
      return null;
    }

    const start = new Date(appliedFilters.startDate);
    const end = new Date(appliedFilters.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }

    const diffMs = end.getTime() - start.getTime();
    const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));

    return nights > 0 ? nights : null;
  }, [appliedFilters]);

  const closeFilters = () => setShowFilters(false);

  const handleMapBoundsChange = useCallback(
    async (nextBounds: MapBounds) => {
      if (areBoundsEqual(mapBounds, nextBounds)) {
        return;
      }

      setMapBounds(nextBounds);
      setError(null);

      const nextFilters = buildFilters(formValues, selectedAmenities, nextBounds);

      try {
        await search(nextFilters);
        setAppliedFilters({
          ...nextFilters,
          amenities: nextFilters.amenities ? [...nextFilters.amenities] : undefined,
        });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('No se pudo realizar la búsqueda.');
        }
      }
    },
    [formValues, mapBounds, search, selectedAmenities],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const requestFilters = buildFilters(formValues, selectedAmenities, mapBounds);
    try {
      await search(requestFilters);
      setAppliedFilters({
        ...requestFilters,
        amenities: requestFilters.amenities ? [...requestFilters.amenities] : undefined,
      });
      closeFilters();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('No se pudo realizar la búsqueda.');
      }
    }
  };

  const handleReset = () => {
    setFormValues({ ...EMPTY_FORM });
    setSelectedAmenities([]);
    setMapBounds(null);
    setAppliedFilters(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gray-dark-800">Explora establecimientos</h1>
        <p className="text-gray-dark-500">
          Ajusta los filtros para encontrar el lugar que mejor se adapte a tu viaje.
        </p>
      </header>

      {showFilters && (
        <div className="fixed inset-0 z-40 flex items-start justify-center px-4 pt-32 pb-10">
          <div
            className="absolute inset-0 bg-gray-dark-900/40 backdrop-blur-sm"
            onClick={closeFilters}
          />
          <form
            onSubmit={handleSubmit}
            className="relative z-50 flex w-full max-w-3xl flex-col gap-6 rounded-3xl bg-white p-6 shadow-2xl"
          >
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-dark-800">Filtros</h2>
                <p className="text-sm text-gray-dark-500">
                  Personaliza tu búsqueda con criterios avanzados.
                </p>
              </div>
              <button
                type="button"
                onClick={closeFilters}
                className="h-10 w-10 rounded-full border border-blue-light-200 text-gray-dark-500 transition-all hover:border-blue-light-300 hover:text-gray-dark-700"
                aria-label="Cerrar filtros"
              >
                ×
              </button>
            </header>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
                Ciudad
                <input
                  name="city"
                  value={formValues.city}
                  onChange={handleInputChange}
                  placeholder="¿A dónde quieres ir?"
                  className="rounded-2xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
                Fecha de llegada
                <input
                  type="date"
                  name="startDate"
                  value={formValues.startDate}
                  onChange={handleInputChange}
                  className="rounded-2xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
                Fecha de salida
                <input
                  type="date"
                  name="endDate"
                  value={formValues.endDate}
                  onChange={handleInputChange}
                  className="rounded-2xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
                Huéspedes
                <input
                  name="capacityTotal"
                  value={formValues.capacityTotal}
                  onChange={handleInputChange}
                  placeholder="Número"
                  inputMode="numeric"
                  className="rounded-2xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
                Precio mínimo
                <input
                  name="minPrice"
                  value={formValues.minPrice}
                  onChange={handleInputChange}
                  placeholder="S/"
                  inputMode="decimal"
                  className="rounded-2xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
                Precio máximo
                <input
                  name="maxPrice"
                  value={formValues.maxPrice}
                  onChange={handleInputChange}
                  placeholder="S/"
                  inputMode="decimal"
                  className="rounded-2xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
                Habitaciones
                <input
                  name="rooms"
                  value={formValues.rooms}
                  onChange={handleInputChange}
                  placeholder="Número"
                  inputMode="numeric"
                  className="rounded-2xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
                Camas
                <input
                  name="beds"
                  value={formValues.beds}
                  onChange={handleInputChange}
                  placeholder="Número"
                  inputMode="numeric"
                  className="rounded-2xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
                Baños
                <input
                  name="baths"
                  value={formValues.baths}
                  onChange={handleInputChange}
                  placeholder="Número"
                  inputMode="numeric"
                  className="rounded-2xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                />
              </label>
            </div>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-dark-600">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {AMENITY_OPTIONS.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity.id);
                  return (
                    <button
                      type="button"
                      key={amenity.id}
                      onClick={() => handleAmenityToggle(amenity.id)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-vivid-500 text-white shadow-md'
                          : 'bg-blue-light-50 text-blue-light-700 border border-blue-light-200 hover:border-blue-light-300'
                      }`}
                    >
                      {amenity.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2">
                {error && <span className="text-sm text-red-500">{error}</span>}
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-sm font-semibold text-blue-light-600 underline-offset-4 hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <button
                  type="button"
                  onClick={closeFilters}
                  className="rounded-2xl border border-blue-light-200 px-5 py-3 text-sm font-semibold text-gray-dark-600 transition-all hover:border-blue-light-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-vivid-500 to-blue-vivid-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-vivid-600 hover:to-blue-vivid-700 focus:ring-2 focus:ring-blue-light-200"
                >
                  {loading ? 'Buscando...' : 'Mostrar resultados'}
                </button>
              </div>
            </footer>
          </form>
        </div>
      )}

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-dark-700">Resultados</h2>
          {loading && <Loader2 className="h-5 w-5 animate-spin text-blue-light-500" />}
        </header>

        {error && !showFilters && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)] lg:items-start">
          <div className="space-y-4">
            {!loading && results.length === 0 && !error ? (
              <p className="rounded-2xl border border-blue-light-150 bg-blue-light-50 px-4 py-6 text-center text-gray-dark-500">
                Usa los filtros para iniciar una búsqueda.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((item, index) => (
                  <PropertySearchCard
                    key={index}
                    data={item}
                    index={index}
                    startDate={appliedFilters?.startDate}
                    endDate={appliedFilters?.endDate}
                    nights={nightsCount ?? undefined}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="h-[320px] w-full lg:sticky lg:top-28 lg:h-[70vh]">
            <PropertySearchMap
              items={results}
              bounds={mapBounds}
              loading={loading}
              onBoundsChange={handleMapBoundsChange}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
