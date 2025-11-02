import { MapPin } from "lucide-react";

export interface LocationOption {
  id: string;
  title: string;
  subtitle: string;
  description: string;
}

export const LOCATION_OPTIONS: LocationOption[] = [
  {
    id: "nearby",
    title: "Cerca",
    subtitle: "Descubre qué hay a tu alrededor",
    description: "Explora estadías a pocos minutos de ti"
  },
  {
    id: "lima",
    title: "Lima, Perú",
    subtitle: "Por lugares emblemáticos como el Centro Histórico",
    description: "Capital vibrante con gastronomía reconocida"
  },
  {
    id: "cusco",
    title: "Cusco, Perú",
    subtitle: "Para vivir la aventura del Valle Sagrado",
    description: "Historia inca y paisajes naturales únicos"
  },
  {
    id: "buenos-aires",
    title: "Buenos Aires, Argentina",
    subtitle: "Por su impresionante arquitectura",
    description: "Cultura, tango y vida nocturna"
  },
  {
    id: "madrid",
    title: "Madrid, España",
    subtitle: "Por su diversión nocturna",
    description: "Museos, parques y gastronomía mediterránea"
  },
];

interface LocationPopoverProps {
  onSelect: (option: LocationOption) => void;
}

export function LocationPopover({ onSelect }: LocationPopoverProps) {
  return (
    <div className="absolute left-0 top-[calc(100%+0.75rem)] z-30 w-[320px] rounded-3xl border border-blue-light-200 bg-white p-4 shadow-xl">
      <header className="px-2 pb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-dark-400">
          Destinos sugeridos
        </p>
      </header>
      <div className="flex flex-col">
  {LOCATION_OPTIONS.map((location) => (
          <button
            key={location.id}
            type="button"
            onClick={() => onSelect(location)}
            className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-blue-light-50"
          >
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-light-100">
              <MapPin className="h-5 w-5 text-blue-light-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-dark-700">{location.title}</p>
              <p className="text-xs text-gray-dark-500">{location.subtitle}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
