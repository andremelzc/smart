interface GuestCounts {
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
  { key: "adults", label: "Adultos", description: "Edad: 13 años o más" },
  { key: "children", label: "Niños", description: "Edades 2 – 12" },
  { key: "babies", label: "Bebés", description: "Menos de 2 años" },
  { key: "pets", label: "Mascotas", description: "¿Traes un animal de servicio?" },
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
                className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-light-200 text-blue-light-600 transition-colors hover:border-blue-light-300"
                aria-label={`Disminuir ${label}`}
              >
                −
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
