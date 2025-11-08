import { MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface LocationOption {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  value?: string;
}

// kept for fallback (empty by default)
export const LOCATION_OPTIONS: LocationOption[] = [];

interface LocationPopoverProps {
  onSelect: (option: LocationOption) => void;
}

type LocationApiRow = {
  ciudad?: unknown;
  CITY?: unknown;
  pais?: unknown;
  COUNTRY?: unknown;
};

type LocationApiResponse = {
  data?: LocationApiRow[];
  message?: string;
};

const toText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
};

export function LocationPopover({ onSelect }: LocationPopoverProps) {
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchLocations = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/locations');
        const payload = (await res.json().catch(() => ({}))) as LocationApiResponse;
        if (!res.ok) throw new Error(payload.message || 'Error fetching locations');

        const rows = Array.isArray(payload.data) ? payload.data : [];
        const transformed: LocationOption[] = rows.map((row, idx) => {
          const ciudad = toText(row.ciudad ?? row.CITY).trim();
          const pais = toText(row.pais ?? row.COUNTRY).trim();
          const title = [ciudad, pais].filter(Boolean).join(', ');
          const value = ciudad.replace(/\s+/g, '-');
          return { id: `${value}-${idx}`, title, subtitle: '', description: '', value };
        });

        if (mounted) setLocations(transformed.length > 0 ? transformed : LOCATION_OPTIONS);
      } catch (err: unknown) {
        console.error('Failed to load locations', err);
        if (mounted) setLocations(LOCATION_OPTIONS);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLocations();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="absolute left-0 top-[calc(100%+0.75rem)] z-30 w-[320px] rounded-3xl border border-blue-light-200 bg-white p-2 shadow-xl">
      <header className="px-3 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-dark-400">Destinos sugeridos</p>
      </header>

      <div className="flex flex-col">
        {loading ? (
          <div className="px-3 py-4 text-sm text-gray-dark-500">Cargando...</div>
        ) : (
          (locations.length > 0 ? locations : LOCATION_OPTIONS).map((location) => (
            <button
              key={location.id}
              type="button"
              onClick={() => onSelect(location)}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-blue-light-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-light-100">
                <MapPin className="h-5 w-5 text-blue-light-500" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-dark-700">{location.title}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
