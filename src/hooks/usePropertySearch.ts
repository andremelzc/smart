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

      const payload: PropertySearchPayload = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Error al buscar propiedades");
      }

      const items = Array.isArray(payload.data) ? [...payload.data] : [];

      if (filters?.orderBy) {
        const priceKeys = [
          "total_price",
          "price_total",
          "amount_total",
          "grand_total",
          "price_per_night",
          "base_price_night",
          "nightly_price",
          "price",
        ];

        const ratingKeys = ["rating", "average_rating", "avg_rating", "score"];

        const toNumber = (value: unknown): number | undefined => {
          if (typeof value === "number" && Number.isFinite(value)) {
            return value;
          }
          if (typeof value === "string") {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) {
              return parsed;
            }
          }
          return undefined;
        };

        const extractMetrics = (entry: Record<string, unknown>) => {
          const normalized = new Map<string, unknown>();
          Object.entries(entry ?? {}).forEach(([key, value]) => {
            normalized.set(key.toLowerCase(), value);
          });

          const read = (keys: string[]): number | undefined => {
            for (const key of keys) {
              const candidate = normalized.get(key.toLowerCase());
              const parsed = toNumber(candidate);
              if (typeof parsed === "number") {
                return parsed;
              }
            }
            return undefined;
          };

          return {
            price: read(priceKeys),
            rating: read(ratingKeys),
          };
        };

        const asAscComparable = (value?: number) =>
          typeof value === "number" && Number.isFinite(value)
            ? value
            : Number.POSITIVE_INFINITY;

        const asDescComparable = (value?: number) =>
          typeof value === "number" && Number.isFinite(value)
            ? value
            : Number.NEGATIVE_INFINITY;

        const itemsWithMeta = items.map((entry, index) => ({
          entry,
          index,
          metrics: extractMetrics(entry),
        }));

        if (filters.orderBy === "price") {
          itemsWithMeta.sort((a, b) => {
            const diff =
              asAscComparable(a.metrics.price) -
              asAscComparable(b.metrics.price);
            return diff !== 0 ? diff : a.index - b.index;
          });
        } else if (filters.orderBy === "rating") {
          itemsWithMeta.sort((a, b) => {
            const diff =
              asDescComparable(b.metrics.rating) -
              asDescComparable(a.metrics.rating);
            return diff !== 0 ? diff : a.index - b.index;
          });
        }

        setResults(itemsWithMeta.map((item) => item.entry));
      } else {
        setResults(items);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { search, results, loading } as const;
}
