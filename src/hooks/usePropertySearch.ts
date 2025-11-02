import { useCallback, useState } from "react";
import type { PropertyFilterDto } from "@/src/types/dtos/properties.dto";

type PropertySearchItem = Record<string, unknown>;

type PropertySearchPayload = {
  success?: boolean;
  data?: PropertySearchItem[];
  message?: string;
};

export function usePropertySearch() {
  const [results, setResults] = useState<PropertySearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (filters: PropertyFilterDto) => {
    setLoading(true);

    try {
      const response = await fetch("/api/properties/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters ?? {}),
      });

      const payload: PropertySearchPayload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Error al buscar propiedades");
      }

      setResults(Array.isArray(payload.data) ? payload.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  return { search, results, loading } as const;
}
