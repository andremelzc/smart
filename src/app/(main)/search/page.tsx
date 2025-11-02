'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { usePropertySearch } from '@/src/hooks/usePropertySearch';
import type { PropertyFilterDto } from '@/src/types/dtos/properties.dto';

const AMENITY_OPTIONS = [
  { id: 53, label: 'Wi-Fi' },
  { id: 54, label: 'Estacionamiento' },
  { id: 55, label: 'Piscina' },
  { id: 56, label: 'Desayuno' },
  { id: 57, label: 'Aire acondicionado' },
];

type FilterFormState = {
  city: string;
  minPrice: string;
  maxPrice: string;
  rooms: string;
  beds: string;
  baths: string;
  latMin: string;
  latMax: string;
  lngMin: string;
  lngMax: string;
};

const EMPTY_FORM: FilterFormState = {
  city: '',
  minPrice: '',
  maxPrice: '',
  rooms: '',
  beds: '',
  baths: '',
  latMin: '',
  latMax: '',
  lngMin: '',
  lngMax: '',
};

export default function PropertySearchPage() {
  const { search, results, loading } = usePropertySearch();
  const [formValues, setFormValues] = useState<FilterFormState>(EMPTY_FORM);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const toggleListener = () => setShowFilters((prev) => !prev);

    window.addEventListener('toggle-search-filters', toggleListener as EventListener);

    return () => {
      window.removeEventListener('toggle-search-filters', toggleListener as EventListener);
    };
  }, []);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (id: number) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((amenityId) => amenityId !== id) : [...prev, id],
    );
  };

  const numericOrUndefined = (value: string): number | undefined => {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const filters: PropertyFilterDto = useMemo(() => {
    const base: PropertyFilterDto = {
      city: formValues.city || undefined,
      minPrice: numericOrUndefined(formValues.minPrice),
      maxPrice: numericOrUndefined(formValues.maxPrice),
      rooms: numericOrUndefined(formValues.rooms),
      beds: numericOrUndefined(formValues.beds),
      baths: numericOrUndefined(formValues.baths),
      latMin: numericOrUndefined(formValues.latMin),
      latMax: numericOrUndefined(formValues.latMax),
      lngMin: numericOrUndefined(formValues.lngMin),
      lngMax: numericOrUndefined(formValues.lngMax),
    };

    if (selectedAmenities.length > 0) {
      base.amenities = selectedAmenities;
    }

    return base;
  }, [formValues, selectedAmenities]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await search(filters);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('No se pudo realizar la búsqueda.');
      }
    }
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
        <form onSubmit={handleSubmit} className="grid gap-6 rounded-3xl border border-blue-light-150 bg-white p-6 shadow-sm">
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
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
              Latitud mínima
              <input
                name="latMin"
                value={formValues.latMin}
                onChange={handleInputChange}
                placeholder="-12.34"
                inputMode="decimal"
                className="rounded-2xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
              Latitud máxima
              <input
                name="latMax"
                value={formValues.latMax}
                onChange={handleInputChange}
                placeholder="-11.90"
                inputMode="decimal"
                className="rounded-2xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
              Longitud mínima
              <input
                name="lngMin"
                value={formValues.lngMin}
                onChange={handleInputChange}
                placeholder="-77.20"
                inputMode="decimal"
                className="rounded-2xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
              Longitud máxima
              <input
                name="lngMax"
                value={formValues.lngMax}
                onChange={handleInputChange}
                placeholder="-76.90"
                inputMode="decimal"
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {error && <span className="text-sm text-red-500">{error}</span>}
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-vivid-500 to-blue-vivid-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-vivid-600 hover:to-blue-vivid-700 focus:ring-2 focus:ring-blue-light-200"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>
      )}

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-dark-700">Resultados</h2>
          {loading && <Loader2 className="h-5 w-5 animate-spin text-blue-light-500" />}
        </header>

        {!loading && results.length === 0 && (
          <p className="rounded-2xl border border-blue-light-150 bg-blue-light-50 px-4 py-6 text-center text-gray-dark-500">
            Usa los filtros para iniciar una búsqueda.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((item, index) => (
            <article
              key={index}
              className="rounded-2xl border border-blue-light-150 bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-dark-700">Propiedad #{index + 1}</h3>
              <pre className="mt-3 max-h-40 overflow-auto rounded-xl bg-blue-light-50 p-3 text-xs text-gray-dark-600">
                {JSON.stringify(item, null, 2)}
              </pre>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
