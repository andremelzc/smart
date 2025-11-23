import type { ChangeEvent, FormEvent } from "react";
import { X } from "lucide-react";

import { QuantityFieldControl } from "./QuantityFieldControl";
import { OrderOptionButton } from "./OrderOptionButton";
import { AmenitiesSelector } from "./AmenitiesSelector";
import type {
  AmenityCategory,
  FilterFormState,
  QuantityFieldKey,
} from "./types";

type FilterModalProps = {
  open: boolean;
  formValues: FilterFormState;
  selectedAmenities: number[];
  amenityCategories: AmenityCategory[];
  amenitiesLoading: boolean;
  amenitiesError: string | null;
  submitError: string | null;
  loadingResults: boolean;
  onClose: () => void;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onQuantityAdjust: (field: QuantityFieldKey, delta: number) => void;
  onOrderBySelect: (value: "price" | "rating") => void;
  onAmenityToggle: (id: number) => void;
  onReset: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function FilterModal({
  open,
  formValues,
  selectedAmenities,
  amenityCategories,
  amenitiesLoading,
  amenitiesError,
  submitError,
  loadingResults,
  onClose,
  onInputChange,
  onQuantityAdjust,
  onOrderBySelect,
  onAmenityToggle,
  onReset,
  onSubmit,
}: FilterModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center px-4 pb-10 pt-20 sm:pt-28">
      <div
        className="absolute inset-0 bg-gray-dark-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <form
        onSubmit={onSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filters-modal-title"
        className="relative z-50 w-full max-w-full sm:max-w-3xl"
      >
        <div className="flex max-h-[calc(100vh-5rem)] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
            <div className="space-y-1">
              <h2
                id="filters-modal-title"
                className="text-xl font-semibold text-gray-dark-800"
              >
                Filtros
              </h2>

              <p className="text-sm text-gray-dark-500">
                Personaliza tu búsqueda con criterios avanzados.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-light-200 text-gray-dark-500 transition-all hover:border-blue-light-300 hover:text-gray-dark-700"
              aria-label="Cerrar filtros"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
                Ciudad
                <input
                  name="city"
                  value={formValues.city}
                  onChange={onInputChange}
                  placeholder="¿A dónde quieres ir?"
                  className="rounded-2xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
                Precio mínimo
                <input
                  name="minPrice"
                  value={formValues.minPrice}
                  onChange={onInputChange}
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
                  onChange={onInputChange}
                  placeholder="S/"
                  inputMode="decimal"
                  className="rounded-2xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
                />
              </label>
            </div>

            <section className="mt-6 space-y-3">
              <h2 className="text-sm font-semibold text-gray-dark-600">
                Espacios disponibles
              </h2>

              <div className="flex flex-col gap-3">
                <QuantityFieldControl
                  label="Habitaciones"
                  description="Número de habitaciones disponibles"
                  value={Number(formValues.rooms) || 0}
                  onIncrement={() => onQuantityAdjust("rooms", 1)}
                  onDecrement={() => onQuantityAdjust("rooms", -1)}
                />

                <QuantityFieldControl
                  label="Camas"
                  description="Total de camas para los huéspedes"
                  value={Number(formValues.beds) || 0}
                  onIncrement={() => onQuantityAdjust("beds", 1)}
                  onDecrement={() => onQuantityAdjust("beds", -1)}
                />

                <QuantityFieldControl
                  label="Baños"
                  description="Cantidad de baños completos"
                  value={Number(formValues.baths) || 0}
                  onIncrement={() => onQuantityAdjust("baths", 1)}
                  onDecrement={() => onQuantityAdjust("baths", -1)}
                />
              </div>
            </section>

            <section className="mt-6 space-y-3">
              <h2 className="text-sm font-semibold text-gray-dark-600">
                Ordenar por
              </h2>

              <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                <OrderOptionButton
                  value="price"
                  label="Precio"
                  description="Ordena por tarifa base de menor a mayor."
                  active={formValues.orderBy === "price"}
                  onSelect={onOrderBySelect}
                />

                <OrderOptionButton
                  value="rating"
                  label="Calificación"
                  description="Destaca primero las mejores reseñas."
                  active={formValues.orderBy === "rating"}
                  onSelect={onOrderBySelect}
                />
              </div>
            </section>

            <section className="mt-6 space-y-5">
              <h2 className="text-sm font-semibold text-gray-dark-600">
                Amenities
              </h2>

              <AmenitiesSelector
                  categories={amenityCategories}
                selectedAmenities={selectedAmenities}
                loading={amenitiesLoading}
                error={amenitiesError}
                onToggle={onAmenityToggle}
              />
            </section>
          </div>

          <footer className="flex flex-col gap-4 border-t border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              {submitError && (
                <span className="text-sm text-red-500">{submitError}</span>
              )}

              <button
                type="button"
                onClick={onReset}
                className="text-sm font-semibold text-blue-light-600 underline-offset-4 hover:underline"
              >
                Limpiar filtros
              </button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-blue-light-200 px-5 py-3 text-sm font-semibold text-gray-dark-600 transition-all hover:border-blue-light-300"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-vivid-500 to-blue-vivid-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-vivid-600 hover:to-blue-vivid-700 focus:ring-2 focus:ring-blue-light-200"
              >
                {loadingResults ? "Buscando..." : "Mostrar resultados"}
              </button>
            </div>
          </footer>
        </div>
      </form>
    </div>
  );
}
