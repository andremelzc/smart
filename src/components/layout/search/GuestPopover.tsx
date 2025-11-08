export interface GuestCounts {
  adults: number;
  children: number;
  babies: number;
  pets: number;
}

interface GuestPopoverProps {
  counts: GuestCounts;
  onChange: (next: GuestCounts) => void;
}

export const GUEST_FIELDS: Array<{
  key: keyof GuestCounts;
  label: string;
  description: string;
}> = [
  { key: 'adults', label: 'Adultos', description: 'Edad: 13 anos o mas' },
  { key: 'children', label: 'Ninos', description: 'Edades 2 a 12' },
  { key: 'babies', label: 'Bebes', description: 'Menos de 2 anos' },
  { key: 'pets', label: 'Mascotas', description: 'Incluye mascotas o animales de servicio' },
];

export function GuestPopover({ counts, onChange }: GuestPopoverProps) {
  const update = (key: keyof GuestCounts, delta: number) => {
    const nextValue = Math.max(0, counts[key] + delta);
    onChange({ ...counts, [key]: nextValue });
  };

  return (
    <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[320px] rounded-3xl border border-blue-light-200 bg-white p-4 shadow-xl">
      <div className="flex flex-col divide-y divide-blue-light-100">
        {GUEST_FIELDS.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-dark-700">{label}</p>
              <p className="text-xs text-gray-dark-500">{description}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => update(key, -1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-light-200 text-blue-light-600 transition-colors hover:border-blue-light-300 disabled:cursor-not-allowed disabled:border-blue-light-100 disabled:text-blue-light-200"
                aria-label={`Disminuir ${label}`}
                disabled={counts[key] === 0}
              >
                -
              </button>
              <span className="w-6 text-center text-sm font-semibold text-gray-dark-700">
                {counts[key]}
              </span>
              <button
                type="button"
                onClick={() => update(key, 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-light-200 text-blue-light-600 transition-colors hover:border-blue-light-300"
                aria-label={`Incrementar ${label}`}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

