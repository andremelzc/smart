import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { X } from "lucide-react";

import { QuantityFieldControl } from "./QuantityFieldControl";
import { OrderOptionButton } from "./OrderOptionButton";
import { AmenitiesSelector } from "./AmenitiesSelector";
import { CollapsibleSection } from "./CollapsibleSection";
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
  const [sectionsOpen, setSectionsOpen] = useState<
    Record<string | number, boolean>
  >({
    spaces: true,
    order: true,
  });

  const handleSectionToggle = (id: string | number) => {
    setSectionsOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-6 pb-10 sm:pt-10">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
      />

      <form
        onSubmit={onSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filters-modal-title"
        className="relative z-[70] w-full max-w-full sm:max-w-3xl"
      >
        <div className="flex max-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
            <div className="space-y-1">
              <h2
                id="filters-modal-title"
                className="text-gray-dark-800 text-xl font-semibold"
              >
                Filtros
              </h2>

              <p className="text-gray-dark-500 text-sm">
                Personaliza tu búsqueda con criterios avanzados.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="border-blue-light-200 text-gray-dark-500 hover:border-blue-light-300 hover:text-gray-dark-700 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all"
              aria-label="Cerrar filtros"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Columna 1: Filtros básicos */}
              <div className="space-y-5">
                <section className="space-y-4">
                  <h3 className="text-gray-dark-700 text-sm font-semibold">
                    Ubicación y Precio
                  </h3>

                  <div className="space-y-3">
                    <label className="text-gray-dark-600 flex flex-col gap-2 text-sm font-medium">
                      Ciudad
                      <input
                        name="city"
                        value={formValues.city}
                        onChange={onInputChange}
                        placeholder="¿A dónde quieres ir?"
                        className="border-blue-light-150 bg-blue-light-50 text-gray-dark-700 focus:border-blue-light-400 focus:ring-blue-light-100 rounded-2xl border px-4 py-3 outline-none focus:ring-2"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-gray-dark-600 flex flex-col gap-2 text-sm font-medium">
                        Precio mín.
                        <input
                          name="minPrice"
                          value={formValues.minPrice}
                          onChange={onInputChange}
                          placeholder="S/"
                          inputMode="decimal"
                          className="border-blue-light-150 bg-blue-light-50 text-gray-dark-700 focus:border-blue-light-400 focus:ring-blue-light-100 rounded-2xl border px-4 py-3 outline-none focus:ring-2"
                        />
                      </label>

                      <label className="text-gray-dark-600 flex flex-col gap-2 text-sm font-medium">
                        Precio máx.
                        <input
                          name="maxPrice"
                          value={formValues.maxPrice}
                          onChange={onInputChange}
                          placeholder="S/"
                          inputMode="decimal"
                          className="border-blue-light-150 bg-blue-light-50 text-gray-dark-700 focus:border-blue-light-400 focus:ring-blue-light-100 rounded-2xl border px-4 py-3 outline-none focus:ring-2"
                        />
                      </label>
                    </div>
                  </div>
                </section>

                <CollapsibleSection
                  id="spaces"
                  title="Espacios disponibles"
                  isOpen={sectionsOpen.spaces ?? true}
                  onToggle={handleSectionToggle}
                >
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
                </CollapsibleSection>

                <CollapsibleSection
                  id="order"
                  title="Ordenar por"
                  isOpen={sectionsOpen.order ?? true}
                  onToggle={handleSectionToggle}
                >
                  <div className="flex flex-col gap-2">
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
                </CollapsibleSection>
              </div>

              {/* Columna 2: Amenities */}
              <div className="space-y-5">
                <section className="space-y-4">
                  <h3 className="text-gray-dark-700 text-sm font-semibold">
                    Amenities
                  </h3>

                  <AmenitiesSelector
                    categories={amenityCategories}
                    selectedAmenities={selectedAmenities}
                    loading={amenitiesLoading}
                    error={amenitiesError}
                    onToggle={onAmenityToggle}
                  />
                </section>
              </div>
            </div>
          </div>

          <footer className="flex flex-col gap-4 border-t border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              {submitError && (
                <span className="text-sm text-red-500">{submitError}</span>
              )}

              <button
                type="button"
                onClick={onReset}
                className="text-blue-light-600 text-sm font-semibold underline-offset-4 hover:underline"
              >
                Limpiar filtros
              </button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="border-blue-light-200 text-gray-dark-600 hover:border-blue-light-300 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="from-blue-vivid-500 to-blue-vivid-600 hover:from-blue-vivid-600 hover:to-blue-vivid-700 focus:ring-blue-light-200 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br px-6 py-3 text-sm font-semibold text-white shadow-md transition-all focus:ring-2"
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
