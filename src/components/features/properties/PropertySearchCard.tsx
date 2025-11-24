"use client";

import { Heart, Star } from "lucide-react";

import { useMemo } from "react";

import { useRouter } from "next/navigation";

import Image from "next/image";

type PropertySearchCardProps = {
  data: Record<string, unknown>;

  index?: number;

  startDate?: string;

  endDate?: string;

  nights?: number | null;
};

const PLACEHOLDER_GRADIENTS = [
  "from-blue-light-200 via-blue-light-100 to-blue-light-300",

  "from-blue-vivid-400 via-blue-vivid-300 to-blue-light-300",

  "from-blue-light-300 via-white to-blue-light-200",

  "from-blue-light-200 via-blue-light-300 to-blue-vivid-400",
];

const BOOLEAN_POSITIVES = new Set(["true", "1", "yes", "y", "si", "si"]);

const CURRENCY_SYMBOLS: Record<string, string> = {
  usd: "$",

  pen: "S/",

  sol: "S/",

  "s/": "S/",

  eur: "",
};

const formatMonth = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("es-PE", { month: "short" });

  return formatter.format(date).replace(".", "");
};

const formatDateRange = (start?: string, end?: string) => {
  if (!start || !end) return null;

  const startDate = new Date(start);

  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }

  const sameMonth =
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  const sameYear = startDate.getFullYear() === endDate.getFullYear();

  const startMonthLabel = formatMonth(startDate);

  const endMonthLabel = formatMonth(endDate);

  const startDay = startDate.getDate();

  const endDay = endDate.getDate();

  if (sameMonth) {
    return `${startDay}  ${endDay} de ${endMonthLabel}`;
  }

  if (sameYear) {
    return `${startDay} ${startMonthLabel}  ${endDay} de ${endMonthLabel}`;
  }

  return `${startDay} ${startMonthLabel} ${startDate.getFullYear()}  ${endDay} ${endMonthLabel} ${endDate.getFullYear()}`;
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

const formatRating = (value?: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const precision = Math.abs(value % 1) < 0.05 ? 1 : 2;

  return value.toFixed(precision);
};

export function PropertySearchCard({
  data,

  index = 0,

  startDate,

  endDate,

  nights,
}: PropertySearchCardProps) {
  const router = useRouter();

  const normalized = useMemo(() => {
    const map = new Map<string, unknown>();

    Object.entries(data ?? {}).forEach(([key, value]) => {
      map.set(key.toLowerCase(), value);
    });

    return map;
  }, [data]);

  const getRaw = (...keys: string[]) => {
    for (const key of keys) {
      const value = normalized.get(key.toLowerCase());

      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }

    return undefined;
  };

  const getString = (...keys: string[]) => {
    const raw = getRaw(...keys);

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

  const getNumber = (...keys: string[]) => {
    const raw = getRaw(...keys);

    if (typeof raw === "number" && Number.isFinite(raw)) {
      return raw;
    }

    if (typeof raw === "string") {
      const parsed = Number(raw);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return undefined;
  };

  const getBoolean = (...keys: string[]) => {
    const raw = getRaw(...keys);

    if (typeof raw === "boolean") {
      return raw;
    }

    if (typeof raw === "number") {
      return raw === 1;
    }

    if (typeof raw === "string") {
      return BOOLEAN_POSITIVES.has(raw.trim().toLowerCase());
    }

    return undefined;
  };

  const imageUrl = getString(
    "cover_image",
    "image_url",
    "main_image",
    "photo_url",
    "photo",
    "thumbnail"
  );

  const propertyId = getNumber("property_id", "id", "propertyid", "prop_id");

  const propertyName =
    getString(
      "property_name",
      "title",
      "property_title",
      "nombre",
      "name",
      "headline"
    ) ?? "Propiedad destacada";

  const propertyType = getString(
    "property_type",
    "type",
    "category_name",
    "category"
  );

  const location =
    getString("district", "neighborhood", "barrio", "zona") ??
    getString("city", "ciudad");

  const rating = getNumber("rating", "average_rating", "avg_rating", "score");

  const reviews = getNumber(
    "reviews",
    "review_count",
    "total_reviews",
    "reviews_count"
  );

  const beds = getNumber("beds", "num_beds", "total_beds");

  const bedrooms = getNumber("bedrooms", "rooms", "num_rooms");

  const baths = getNumber("bathrooms", "baths", "num_baths");

  const pricePerNight = getNumber(
    "price_per_night",
    "base_price_night",
    "nightly_price",
    "price"
  );

  const totalPriceRaw = getNumber(
    "total_price",
    "price_total",
    "amount_total",
    "grand_total"
  );

  const currency = getString("currency", "currency_code", "moneda");

  const hostName = getString("host_name", "owner_name", "anfitrion");

  const hostAvatar = getString(
    "host_avatar",
    "owner_avatar",
    "host_image",
    "host_photo"
  );

  const isSuperHost = getBoolean("is_super_host", "super_host", "superhost");

  const isGuestFavorite = getBoolean(
    "is_guest_favorite",
    "guest_favorite",
    "favorite"
  );

  const totalPrice =
    totalPriceRaw ??
    (pricePerNight && nights ? pricePerNight * nights : undefined);

  const priceLabel = formatCurrency(totalPrice ?? pricePerNight, currency);

  const nightsLabel = (() => {
    if (totalPrice && nights && nights > 0) {
      return `por ${nights} noche${nights > 1 ? "s" : ""}`;
    }

    if (totalPrice) {
      return "precio total";
    }

    if (pricePerNight) {
      return "por noche";
    }

    return null;
  })();

  const nightlyLabel =
    totalPrice && pricePerNight && nights && nights > 0
      ? formatCurrency(pricePerNight, currency)
      : null;

  const dateRangeLabel = formatDateRange(startDate, endDate);

  const ratingLabel = formatRating(rating);

  const gradientClass =
    PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length];

  const hostInitial = hostName ? hostName.charAt(0).toUpperCase() : "A";

  const detailLine = (() => {
    const parts: string[] = [];

    if (bedrooms) {
      parts.push(`${bedrooms} dormitorio${bedrooms > 1 ? "s" : ""}`);
    }

    if (beds) {
      parts.push(`${beds} cama${beds > 1 ? "s" : ""}`);
    }

    if (baths) {
      parts.push(`${baths} bano${baths > 1 ? "s" : ""}`);
    }

    return parts.join("  ");
  })();

  const handleCardClick = () => {
    if (propertyId) {
      router.push(`/properties/${propertyId}`);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se dispare el click del card

    // Aqui puedes agregar la logica para favoritos
  };

  return (
    <article
      className="border-blue-light-150 flex h-full cursor-pointer flex-col overflow-hidden rounded-[28px] border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={propertyName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradientClass} text-3xl font-semibold text-white`}
          >
            {propertyName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {isSuperHost && (
            <span className="bg-gray-dark-900/85 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white shadow">
              <Star className="h-3 w-3" fill="currentColor" />
              Superanfitrion
            </span>
          )}

          {isGuestFavorite && (
            <span className="text-gray-dark-700 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur">
              Favorito entre huespedes
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleFavoriteClick}
          className="text-gray-dark-500 hover:text-blue-light-600 absolute top-4 right-4 rounded-full bg-white/85 p-2 shadow-sm backdrop-blur transition hover:bg-white"
          aria-label="Guardar en favoritos"
        >
          <Heart className="h-4 w-4" />
        </button>

        {(hostName || hostAvatar) && (
          <div className="text-gray-dark-600 absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur">
            {hostAvatar ? (
              <Image
                src={hostAvatar}
                alt={hostName ?? "Anfitrion"}
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="bg-blue-light-200 text-blue-light-700 flex h-7 w-7 items-center justify-center rounded-full">
                {hostInitial}
              </div>
            )}

            {hostName && <span>{hostName}</span>}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            {propertyType && (
              <span className="text-blue-light-600 text-xs font-semibold tracking-wide uppercase">
                {propertyType}
              </span>
            )}

            <h3 className="text-gray-dark-800 truncate text-lg font-semibold">
              {propertyName}
            </h3>

            {location && (
              <p className="text-gray-dark-500 text-sm">{location}</p>
            )}

            {detailLine && (
              <p className="text-gray-dark-500 text-sm">{detailLine}</p>
            )}

            {dateRangeLabel && (
              <p className="text-gray-dark-500 text-sm">{dateRangeLabel}</p>
            )}
          </div>

          {ratingLabel && (
            <div className="bg-blue-light-50 text-gray-dark-700 flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold">
              <Star
                className="text-blue-light-500 h-4 w-4"
                fill="currentColor"
              />

              <span>{ratingLabel}</span>

              {typeof reviews === "number" && reviews > 0 && (
                <span className="text-gray-dark-500 text-xs">
                  ({Math.round(reviews)})
                </span>
              )}
            </div>
          )}
        </div>

        <div className="border-blue-light-100 mt-auto flex flex-col gap-1 border-t pt-3">
          {priceLabel && (
            <span className="text-gray-dark-800 text-base font-semibold">
              {priceLabel}
            </span>
          )}

          {nightsLabel && (
            <span className="text-gray-dark-500 text-sm">
              {nightsLabel}

              {nightlyLabel ? `  ${nightlyLabel} por noche` : ""}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
