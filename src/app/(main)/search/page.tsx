"use client";

import {
  ChangeEvent,
  FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  startTransition,
} from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { FilterModal } from "@/src/components/search/FilterModal";
import {
  type MapRenderer,
  SearchResults,
} from "@/src/components/search/SearchResults";
import type {
  AmenityCategory,
  AmenityOption,
  FilterFormState,
  OrderByValue,
  QuantityFieldKey,
} from "@/src/components/search/types";
import type { MapBounds } from "@/src/components/features/properties/PropertySearchMap";
import { usePropertySearch } from "@/src/hooks/usePropertySearch";
import type { PropertyFilterDto } from "@/src/types/dtos/properties.dto";

const PropertySearchMap = dynamic(
  () =>
    import("@/src/components/features/properties/PropertySearchMap").then(
      (mod) => mod.PropertySearchMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center rounded-lg bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    ),
  }
) as MapRenderer;

type AmenityApiItem = {
  id?: unknown;
  label?: unknown;
};

type AmenityCategoryApiItem = {
  id?: unknown;
  name?: unknown;
  categoria?: unknown;
  amenities?: unknown;
};

type AmenityApiResponse = {
  data?: AmenityCategoryApiItem[];
  message?: string;
};

const BOUNDS_TOLERANCE = 1e-5;

const EMPTY_FORM: FilterFormState = {
  city: "",
  startDate: "",
  endDate: "",
  minPrice: "",
  maxPrice: "",
  rooms: "",
  beds: "",
  baths: "",
  adults: "0",
  children: "0",
  babies: "0",
  pets: "0",
  orderBy: "",
};

const parseNumericString = (
  value: string | null | undefined
): number | undefined => {
  if (!value) return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parsePositiveInteger = (
  value: string | null | undefined
): number | undefined => {
  const parsed = parseNumericString(value);
  return typeof parsed === "number" && parsed > 0 ? parsed : undefined;
};

const buildFilters = (
  values: FilterFormState,
  amenities: number[],
  bounds: MapBounds | null
): PropertyFilterDto => {
  const base: PropertyFilterDto = {
    city: values.city || undefined,
    startDate: values.startDate || undefined,
    endDate: values.endDate || undefined,
    minPrice: parseNumericString(values.minPrice),
    maxPrice: parseNumericString(values.maxPrice),
    rooms: parsePositiveInteger(values.rooms),
    beds: parsePositiveInteger(values.beds),
    baths: parsePositiveInteger(values.baths),
    adults: parsePositiveInteger(values.adults),
    children: parsePositiveInteger(values.children),
    babies: parsePositiveInteger(values.babies),
    pets: parsePositiveInteger(values.pets),
  };

  if (values.orderBy) {
    base.orderBy = values.orderBy;
  }

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

function PropertySearchContent() {
  const { search, results, loading } = usePropertySearch();
  const searchParams = useSearchParams();

  const [formValues, setFormValues] = useState<FilterFormState>({
    ...EMPTY_FORM,
  });
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [amenityCategories, setAmenityCategories] = useState<AmenityCategory[]>(
    []
  );
  const [amenitiesLoading, setAmenitiesLoading] = useState(true);
  const [amenitiesError, setAmenitiesError] = useState<string | null>(null);
  const [appliedFilters, setAppliedFilters] =
    useState<PropertyFilterDto | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [hasReceivedInitialBounds, setHasReceivedInitialBounds] = useState(false);
  const boundsDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  const searchParamsKey = searchParams.toString();

  useEffect(() => {
    // Cancelar búsqueda anterior si existe
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }

    if (!searchParamsKey) {
      startTransition(() => {
        setFormValues({ ...EMPTY_FORM });
        setSelectedAmenities([]);
        setMapBounds(null);
        setAppliedFilters(null);
        setError(null);
        setHasReceivedInitialBounds(false);
      });
      // No hacer búsqueda aquí - esperar a que el mapa proporcione los bounds iniciales
      return;
    }

    const params = new URLSearchParams(searchParamsKey);

    const orderByRawList = params.getAll("orderBy");
    const primaryOrderRaw =
      orderByRawList.length > 0 ? orderByRawList[0] : params.get("orderBy");
    const normalizedOrder =
      typeof primaryOrderRaw === "string"
        ? primaryOrderRaw.trim().toLowerCase()
        : "";
    const orderByValue: OrderByValue =
      normalizedOrder === "price" || normalizedOrder === "rating"
        ? normalizedOrder
        : "";

    const nextForm: FilterFormState = {
      ...EMPTY_FORM,
      city: params.get("city") ?? "",
      startDate: params.get("startDate") ?? "",
      endDate: params.get("endDate") ?? "",
      minPrice: params.get("minPrice") ?? "",
      maxPrice: params.get("maxPrice") ?? "",
      rooms: params.get("rooms") ?? "",
      beds: params.get("beds") ?? "",
      baths: params.get("baths") ?? "",
      adults: params.get("adults") ?? "0",
      children: params.get("children") ?? "0",
      babies: params.get("babies") ?? "0",
      pets: params.get("pets") ?? "0",
      orderBy: orderByValue,
    };

    const amenityValues = params.getAll("amenities");
    const amenityTokens =
      amenityValues.length > 0
        ? amenityValues
        : (params.get("amenities") ?? "")
            .split(",")
            .map((token) => token.trim())
            .filter(Boolean);

    const parsedAmenityIds = amenityTokens
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0);

    const latMin = parseNumericString(params.get("latMin"));
    const latMax = parseNumericString(params.get("latMax"));
    const lngMin = parseNumericString(params.get("lngMin"));
    const lngMax = parseNumericString(params.get("lngMax"));

    const initialBounds =
      typeof latMin === "number" &&
      typeof latMax === "number" &&
      typeof lngMin === "number" &&
      typeof lngMax === "number"
        ? { latMin, latMax, lngMin, lngMax }
        : null;

    startTransition(() => {
      setFormValues(nextForm);
      setSelectedAmenities(parsedAmenityIds);
      setMapBounds(initialBounds);
      setError(null);
    });

    const initialFilters = buildFilters(
      nextForm,
      parsedAmenityIds,
      initialBounds
    );

    search(initialFilters)
      .then(() => {
        setAppliedFilters({
          ...initialFilters,
          amenities: initialFilters.amenities
            ? [...initialFilters.amenities]
            : undefined,
          orderBy: initialFilters.orderBy,
        });
      })
      .catch((err) => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("No se pudo realizar la busqueda.");
        }
      });
  }, [searchParamsKey, search]);

  useEffect(() => {
    const handleOpenFilters = () => setShowFilters(true);

    window.addEventListener("toggle-search-filters", handleOpenFilters);
    return () => {
      window.removeEventListener("toggle-search-filters", handleOpenFilters);
    };
  }, []);

  // Cleanup de timeouts al desmontar
  useEffect(() => {
    return () => {
      if (boundsDebounceRef.current) {
        clearTimeout(boundsDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showFilters) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowFilters(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [showFilters]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    }));
  };

  const adjustQuantityField = (field: QuantityFieldKey, delta: number) => {
    setFormValues((prev) => {
      const current = Number(prev[field]) || 0;
      const nextValue = Math.max(0, current + delta);

      return { ...prev, [field]: String(nextValue) };
    });
  };

  const handleOrderBySelect = (value: "price" | "rating") => {
    setFormValues((prev) => ({
      ...prev,
      orderBy: prev.orderBy === value ? "" : value,
    }));
  };

  const handleAmenityToggle = (id: number) => {
    setSelectedAmenities((prev) =>
      prev.includes(id)
        ? prev.filter((amenityId) => amenityId !== id)
        : [...prev, id]
    );
  };

  useEffect(() => {
    let cancelled = false;

    const fetchAmenities = async () => {
      try {
        setAmenitiesLoading(true);
        setAmenitiesError(null);

        const response = await fetch("/api/amenities");
        const payload = (await response
          .json()
          .catch(() => ({}))) as AmenityApiResponse;

        if (!response.ok) {
          const message =
            payload.message ?? "No se pudo obtener la lista de amenities.";
          throw new Error(message);
        }

        const rawCategories = Array.isArray(payload.data) ? payload.data : [];

        const toAmenityOption = (
          item: AmenityApiItem
        ): AmenityOption | null => {
          const idValue = item.id;
          const labelValue = item.label;

          const id =
            typeof idValue === "number" || typeof idValue === "string"
              ? Number(idValue)
              : NaN;
          const label = typeof labelValue === "string" ? labelValue.trim() : "";

          if (!Number.isInteger(id) || id <= 0 || label.length === 0) {
            return null;
          }

          return { id, label };
        };

        const toAmenityCategory = (
          item: AmenityCategoryApiItem
        ): AmenityCategory | null => {
          const idValue =
            (item?.id as unknown) ??
            (item as { id_categoria?: unknown })?.id_categoria;
          const nameValue =
            (item?.name as unknown) ??
            (item as { categoria?: unknown })?.categoria;

          const id =
            typeof idValue === "number" || typeof idValue === "string"
              ? Number(idValue)
              : NaN;
          const name = typeof nameValue === "string" ? nameValue.trim() : "";

          if (!Number.isInteger(id) || id <= 0 || name.length === 0) {
            return null;
          }

          const rawAmenities = Array.isArray(item?.amenities)
            ? (item.amenities as AmenityApiItem[])
            : [];

          const amenities = rawAmenities
            .map(toAmenityOption)
            .filter((amenity): amenity is AmenityOption => amenity !== null);

          if (amenities.length === 0) {
            return null;
          }

          return { id, name, amenities };
        };

        const nextCategories = rawCategories
          .map(toAmenityCategory)
          .filter((category): category is AmenityCategory => category !== null);

        if (!cancelled) {
          setAmenityCategories(nextCategories);
        }
      } catch (err: unknown) {
        if (cancelled) {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "No se pudo obtener la lista de amenities.";
        setAmenitiesError(message);
      } finally {
        if (!cancelled) {
          setAmenitiesLoading(false);
        }
      }
    };

    fetchAmenities();

    return () => {
      cancelled = true;
    };
  }, []);

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
    (nextBounds: MapBounds) => {
      // Ignorar cambios de bounds si estamos reseteando
      if (isResetting) {
        return;
      }

      if (areBoundsEqual(mapBounds, nextBounds)) {
        return;
      }

      // Cancelar debounce anterior si existe
      if (boundsDebounceRef.current) {
        clearTimeout(boundsDebounceRef.current);
      }

      setMapBounds(nextBounds);

      // Debounce la búsqueda por cambios de mapa para evitar múltiples llamadas
      boundsDebounceRef.current = setTimeout(async () => {
        // Verificar de nuevo por si isResetting cambió durante el debounce
        if (isResetting) {
          return;
        }

        setError(null);

        const nextFilters = buildFilters(
          formValues,
          selectedAmenities,
          nextBounds
        );

        try {
          await search(nextFilters);
          setAppliedFilters({
            ...nextFilters,
            amenities: nextFilters.amenities
              ? [...nextFilters.amenities]
              : undefined,
            orderBy: nextFilters.orderBy,
          });
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("No se pudo realizar la búsqueda.");
          }
        }
      }, 300);
    },
    [formValues, isResetting, mapBounds, search, selectedAmenities]
  );

  // Handler para los bounds iniciales del mapa (primera carga)
  const handleInitialBounds = useCallback(
    async (initialBounds: MapBounds) => {
      // Solo procesar si no tenemos searchParams y no hemos recibido bounds antes
      if (searchParamsKey || hasReceivedInitialBounds) {
        return;
      }

      setHasReceivedInitialBounds(true);
      setMapBounds(initialBounds);
      setError(null);

      // Ejecutar búsqueda con los bounds del área visible del mapa
      const initialFilters = buildFilters(formValues, selectedAmenities, initialBounds);

      try {
        await search(initialFilters);
        setAppliedFilters({
          ...initialFilters,
          amenities: initialFilters.amenities
            ? [...initialFilters.amenities]
            : undefined,
          orderBy: initialFilters.orderBy,
        });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("No se pudo realizar la búsqueda.");
        }
      }
    },
    [formValues, hasReceivedInitialBounds, search, searchParamsKey, selectedAmenities]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);

    const requestFilters = buildFilters(
      formValues,
      selectedAmenities,
      mapBounds
    );

    try {
      await search(requestFilters);
      setAppliedFilters({
        ...requestFilters,
        amenities: requestFilters.amenities
          ? [...requestFilters.amenities]
          : undefined,
        orderBy: requestFilters.orderBy,
      });
      closeFilters();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("No se pudo realizar la busqueda.");
      }
    }
  };

  const handleReset = async () => {
    // Cancelar cualquier debounce pendiente del mapa
    if (boundsDebounceRef.current) {
      clearTimeout(boundsDebounceRef.current);
      boundsDebounceRef.current = null;
    }

    // Marcar que estamos reseteando para ignorar cambios de bounds del mapa
    setIsResetting(true);

    // Guardar los bounds actuales del mapa antes de resetear
    const currentBounds = mapBounds;

    // Limpiar todo el estado de filtros
    setFormValues({ ...EMPTY_FORM });
    setSelectedAmenities([]);
    setAppliedFilters(null);
    setError(null);
    // No resetear hasReceivedInitialBounds ni mapBounds para mantener el área visible

    // Notify Navbar to clear its filters too
    window.dispatchEvent(new CustomEvent("clear-search-filters"));

    // Ejecutar búsqueda solo con los bounds del mapa actual (sin otros filtros)
    try {
      const boundsOnlyFilters: PropertyFilterDto = currentBounds
        ? {
            latMin: currentBounds.latMin,
            latMax: currentBounds.latMax,
            lngMin: currentBounds.lngMin,
            lngMax: currentBounds.lngMax,
          }
        : {};
      await search(boundsOnlyFilters);
      setAppliedFilters(boundsOnlyFilters);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("No se pudo realizar la búsqueda.");
      }
    } finally {
      // Permitir cambios de bounds del mapa nuevamente después de un pequeño delay
      setTimeout(() => {
        setIsResetting(false);
      }, 500);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-gray-dark-800 text-3xl font-semibold">
          Explora establecimientos
        </h1>

        <p className="text-gray-dark-500">
          Ajusta los filtros para encontrar el lugar que mejor se adapte a tu
          viaje.
        </p>
      </header>

      <FilterModal
        open={showFilters}
        formValues={formValues}
        selectedAmenities={selectedAmenities}
        amenityCategories={amenityCategories}
        amenitiesLoading={amenitiesLoading}
        amenitiesError={amenitiesError}
        submitError={error}
        loadingResults={loading}
        onClose={closeFilters}
        onInputChange={handleInputChange}
        onQuantityAdjust={adjustQuantityField}
        onOrderBySelect={handleOrderBySelect}
        onAmenityToggle={handleAmenityToggle}
        onReset={handleReset}
        onSubmit={handleSubmit}
      />

      <SearchResults
        results={results}
        loading={loading}
        error={error}
        showFilters={showFilters}
        mapBounds={mapBounds}
        onBoundsChange={handleMapBoundsChange}
        onInitialBounds={handleInitialBounds}
        appliedFilters={appliedFilters}
        nightsCount={nightsCount}
        MapComponent={PropertySearchMap}
      />
    </div>
  );
}

export default function PropertySearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <PropertySearchContent />
    </Suspense>
  );
}
