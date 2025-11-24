"use client";

import { useEffect, useMemo, useRef, useState, startTransition } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L, { type LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapBounds = {
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
};

type PropertySearchMapProps = {
  items: Record<string, unknown>[];
  bounds: MapBounds | null;
  loading?: boolean;
  onBoundsChange: (nextBounds: MapBounds) => void | Promise<void>;
};

type MarkerPoint = {
  id: string;
  position: [number, number];
  label: string;
};

const DEFAULT_CENTER: [number, number] = [-12.0464, -77.0428];

const DEFAULT_ZOOM = 12;

const BOUNDS_PADDING: [number, number] = [48, 48];

const BOUNDS_TOLERANCE = 1e-5;

const PRICE_KEYS = [
  "total_price",
  "price_total",
  "amount_total",
  "grand_total",
  "price_per_night",
  "base_price_night",
  "nightly_price",
  "price",
];

const CURRENCY_KEYS = ["currency", "currency_code", "moneda"];

// const TITLE_KEYS = ['property_name', 'title', 'name', 'headline']; // Currently unused

const LATITUDE_KEYS = ["latitude", "lat", "latitud"];
const LONGITUDE_KEYS = ["longitude", "lng", "longitud", "lon"];
const CURRENCY_SYMBOLS: Record<string, string> = {
  usd: "$",
  pen: "S/",
  sol: "S/",
  "s/": "S/",
  eur: "",
};

const escapeHtml = (value: string) =>
  value

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

const isBoundsEqual = (a: MapBounds | null, b: MapBounds | null) => {
  if (!a || !b) return false;

  return (
    Math.abs(a.latMin - b.latMin) < BOUNDS_TOLERANCE &&
    Math.abs(a.latMax - b.latMax) < BOUNDS_TOLERANCE &&
    Math.abs(a.lngMin - b.lngMin) < BOUNDS_TOLERANCE &&
    Math.abs(a.lngMax - b.lngMax) < BOUNDS_TOLERANCE
  );
};

const normalizeRecord = (input: Record<string, unknown> | undefined) => {
  const map = new Map<string, unknown>();

  if (!input) return map;

  Object.entries(input).forEach(([key, value]) =>
    map.set(key.toLowerCase(), value)
  );

  return map;
};

const getValue = (normalized: Map<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = normalized.get(key.toLowerCase());

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
};

const getNumber = (normalized: Map<string, unknown>, keys: string[]) => {
  const raw = getValue(normalized, keys);

  if (typeof raw === "number" && Number.isFinite(raw)) return raw;

  if (typeof raw === "string") {
    const parsed = Number(raw);

    if (Number.isFinite(parsed)) return parsed;
  }

  return undefined;
};

const getString = (normalized: Map<string, unknown>, keys: string[]) => {
  const raw = getValue(normalized, keys);

  if (typeof raw === "string") {
    const trimmed = raw.trim();

    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  if (typeof raw === "number" && Number.isFinite(raw)) {
    return String(raw);
  }

  return undefined;
};

const formatCurrency = (value?: number, currencyCode?: string) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const code = currencyCode ? currencyCode.toLowerCase() : "pen";

  const symbol = CURRENCY_SYMBOLS[code] ?? "S/";

  const hasDecimals = Math.abs(value % 1) > 0;

  const formatted = value.toLocaleString("es-PE", {
    minimumFractionDigits: hasDecimals ? 2 : 0,

    maximumFractionDigits: hasDecimals ? 2 : 0,
  });

  return `${symbol}${formatted}`;
};

const createPriceIcon = (label: string) => {
  const safeLabel = escapeHtml(label);

  const html = `

    <div style="display:flex;align-items:center;justify-content:center;padding:4px 10px;border-radius:999px;background:#2563eb;color:#fff;font-weight:600;font-size:13px;box-shadow:0 10px 25px rgba(37,99,235,0.25);border:1px solid rgba(255,255,255,0.6);white-space:nowrap;">

      ${safeLabel}

    </div>

  `;

  return L.divIcon({
    className: "property-price-marker",

    html,

    iconSize: [60, 28],

    iconAnchor: [30, 28],
  });
};

const computeItemsBounds = (markers: MarkerPoint[]): MapBounds | null => {
  if (markers.length === 0) return null;

  let latMin = Infinity;

  let latMax = -Infinity;

  let lngMin = Infinity;

  let lngMax = -Infinity;

  markers.forEach(({ position: [lat, lng] }) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    latMin = Math.min(latMin, lat);

    latMax = Math.max(latMax, lat);

    lngMin = Math.min(lngMin, lng);

    lngMax = Math.max(lngMax, lng);
  });

  if (
    !Number.isFinite(latMin) ||
    !Number.isFinite(latMax) ||
    !Number.isFinite(lngMin) ||
    !Number.isFinite(lngMax)
  ) {
    return null;
  }

  return { latMin, latMax, lngMin, lngMax };
};

const MapEventBridge = ({
  explicitBounds,

  markersBounds,

  onBoundsChange,
}: {
  explicitBounds: MapBounds | null;

  markersBounds: MapBounds | null;

  onBoundsChange: (nextBounds: MapBounds) => void | Promise<void>;
}) => {
  const map = useMap();

  const lastAppliedBounds = useRef<MapBounds | null>(null);

  const userInteracting = useRef(false);

  useEffect(() => {
    const handleMoveStart = () => {
      userInteracting.current = true;
    };

    const handleMoveEnd = () => {
      if (!userInteracting.current) return;

      userInteracting.current = false;

      const leafletBounds = map.getBounds();

      const nextBounds: MapBounds = {
        latMin: leafletBounds.getSouth(),

        latMax: leafletBounds.getNorth(),

        lngMin: leafletBounds.getWest(),

        lngMax: leafletBounds.getEast(),
      };

      if (!isBoundsEqual(lastAppliedBounds.current, nextBounds)) {
        onBoundsChange(nextBounds);

        lastAppliedBounds.current = nextBounds;
      }
    };

    map.on("movestart", handleMoveStart);

    map.on("moveend", handleMoveEnd);

    return () => {
      map.off("movestart", handleMoveStart);

      map.off("moveend", handleMoveEnd);
    };
  }, [map, onBoundsChange]);

  useEffect(() => {
    const targetBounds = explicitBounds ?? markersBounds;

    if (!targetBounds) return;

    const leafletBounds: LatLngBoundsExpression = [
      [targetBounds.latMin, targetBounds.lngMin],

      [targetBounds.latMax, targetBounds.lngMax],
    ];

    if (isBoundsEqual(lastAppliedBounds.current, targetBounds)) {
      return;
    }

    lastAppliedBounds.current = targetBounds;

    map.fitBounds(leafletBounds, { padding: BOUNDS_PADDING, animate: false });
  }, [explicitBounds, markersBounds, map]);

  return null;
};

export function PropertySearchMap({
  items,
  bounds,
  loading,
  onBoundsChange,
}: PropertySearchMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setIsClient(true);
    });
  }, []);

  const markers = useMemo<MarkerPoint[]>(() => {
    const points: MarkerPoint[] = [];

    items.forEach((item, index) => {
      const normalized = normalizeRecord(item);

      const latitude = getNumber(normalized, LATITUDE_KEYS);

      const longitude = getNumber(normalized, LONGITUDE_KEYS);

      if (typeof latitude !== "number" || typeof longitude !== "number") {
        return;
      }

      const price = getNumber(normalized, PRICE_KEYS);

      const currency = getString(normalized, CURRENCY_KEYS);

      const priceLabel = formatCurrency(price, currency) ?? "S/--";

      const identifier =
        getString(normalized, ["property_id", "id", "propertyid", "prop_id"]) ??
        String(index);

      points.push({
        id: identifier,

        position: [latitude, longitude],

        label: priceLabel,
      });
    });

    return points;
  }, [items]);

  const markersBounds = useMemo(() => computeItemsBounds(markers), [markers]);

  const initialCenter = useMemo(() => {
    if (bounds) {
      return [
        (bounds.latMin + bounds.latMax) / 2,
        (bounds.lngMin + bounds.lngMax) / 2,
      ] as [number, number];
    }

    if (markersBounds) {
      return [
        (markersBounds.latMin + markersBounds.latMax) / 2,

        (markersBounds.lngMin + markersBounds.lngMax) / 2,
      ] as [number, number];
    }

    return DEFAULT_CENTER;
  }, [bounds, markersBounds]);

  if (!isClient) {
    return (
      <div className="text-gray-dark-500 flex h-full w-full items-center justify-center text-sm">
        Cargando mapa...
      </div>
    );
  }

  return (
    <div className="border-blue-light-150 relative h-full w-full overflow-hidden rounded-3xl border bg-white shadow-sm">
      <MapContainer
        className="h-full w-full"
        center={initialCenter}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        minZoom={3}
        maxZoom={18}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution={
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }
        />

        <MapEventBridge
          explicitBounds={bounds}
          markersBounds={markersBounds}
          onBoundsChange={onBoundsChange}
        />

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={createPriceIcon(marker.label)}
          />
        ))}
      </MapContainer>

      {loading && (
        <div className="text-blue-light-700 pointer-events-none absolute inset-0 flex items-center justify-center bg-white/60 text-sm font-medium backdrop-blur-sm">
          Actualizando resultados...
        </div>
      )}
    </div>
  );
}
