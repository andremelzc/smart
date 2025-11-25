export interface GuestCounts {
  adults: number;
  children: number;
  babies: number;
  pets: number;
}

interface GuestPopoverProps {
  counts: GuestCounts;
  onChange: (next: GuestCounts) => void;
  onClear?: () => void;
  maxGuests?: number;
}

export const GUEST_FIELDS: Array<{
  key: keyof GuestCounts;
  label: string;
  description: string;
}> = [
  { key: "adults", label: "Adultos", description: "Edad: 13 anos o mas" },
  { key: "children", label: "Ninos", description: "Edades 2 a 12" },
  { key: "babies", label: "Bebes", description: "Menos de 2 anos" },
  {
    key: "pets",
    label: "Mascotas",
    description: "Incluye mascotas o animales de servicio",
  },
];

export function GuestPopover({
  counts,
  onChange,
  onClear,
  maxGuests,
}: GuestPopoverProps) {
  const update = (key: keyof GuestCounts, delta: number) => {
    const minValue = key === "adults" ? 1 : 0;
    const nextValue = Math.max(minValue, counts[key] + delta);

    // Validar que adultos + niños no excedan maxGuests
    if (maxGuests && (key === "adults" || key === "children")) {
      const newGuestCount =
        key === "adults"
          ? nextValue + counts.children
          : counts.adults + nextValue;

      if (newGuestCount > maxGuests) {
        return; // No permitir el cambio si excede el máximo
      }
    }

    onChange({ ...counts, [key]: nextValue });
  };

  const hasGuests =
    counts.adults > 0 ||
    counts.children > 0 ||
    counts.babies > 0 ||
    counts.pets > 0;

  return (
    <div className="border-blue-light-200 absolute top-[calc(100%+0.75rem)] right-0 z-30 w-[320px] rounded-3xl border bg-white p-4 shadow-xl">
      {hasGuests && onClear && (
        <div className="border-blue-light-100 mb-3 flex justify-end border-b pb-3">
          <button
            type="button"
            onClick={onClear}
            className="text-blue-light-600 hover:text-blue-light-700 text-xs font-medium"
          >
            Limpiar todo
          </button>
        </div>
      )}
      <div className="divide-blue-light-100 flex flex-col divide-y">
        {GUEST_FIELDS.map(({ key, label, description }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 py-3"
          >
            <div>
              <p className="text-gray-dark-700 text-sm font-semibold">
                {label}
              </p>
              <p className="text-gray-dark-500 text-xs">{description}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => update(key, -1)}
                  className="border-blue-light-200 text-blue-light-600 hover:border-blue-light-300 disabled:border-blue-light-100 disabled:text-blue-light-200 flex h-8 w-8 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed"
                  aria-label={`Disminuir ${label}`}
                  disabled={key === "adults" ? counts[key] <= 1 : counts[key] === 0}
              >
                -
              </button>
              <span className="text-gray-dark-700 w-6 text-center text-sm font-semibold">
                {counts[key]}
              </span>
              <button
                type="button"
                onClick={() => update(key, 1)}
                className="border-blue-light-200 text-blue-light-600 hover:border-blue-light-300 disabled:border-blue-light-100 disabled:text-blue-light-200 flex h-8 w-8 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed"
                aria-label={`Incrementar ${label}`}
                disabled={
                  maxGuests && (key === "adults" || key === "children")
                    ? counts.adults + counts.children >= maxGuests
                    : false
                }
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
