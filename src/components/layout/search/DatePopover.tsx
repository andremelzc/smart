import { Calendar } from "lucide-react";

interface DatePopoverProps {
  checkIn?: string;
  checkOut?: string;
  onChange: (next: { checkIn?: string; checkOut?: string }) => void;
  onClear?: () => void;
}

export function DatePopover({
  checkIn,
  checkOut,
  onChange,
  onClear,
}: DatePopoverProps) {
  // Convertir de YYYY-MM-DD a DD/MM/YYYY para mostrar
  const formatToDisplay = (dateString?: string): string => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // Convertir de DD/MM/YYYY a YYYY-MM-DD para guardar
  const formatToISO = (displayString: string): string => {
    if (!displayString) return "";
    // Eliminar caracteres no numéricos excepto /
    const cleaned = displayString.replace(/[^\d/]/g, "");
    const parts = cleaned.split("/");

    if (parts.length === 3) {
      const [day, month, year] = parts;
      // Validar que sean números válidos
      if (day && month && year && year.length === 4) {
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    }
    return "";
  };

  const handleCheckInChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const displayValue = event.target.value;
    const isoValue = formatToISO(displayValue);
    onChange({ checkIn: isoValue || undefined, checkOut });
  };

  const handleCheckOutChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const displayValue = event.target.value;
    const isoValue = formatToISO(displayValue);
    onChange({ checkIn, checkOut: isoValue || undefined });
  };

  return (
    <div className="border-blue-light-200 absolute top-[calc(100%+0.75rem)] left-1/2 z-30 w-full max-w-xl -translate-x-1/2 rounded-3xl border bg-white p-5 shadow-xl">
      <div className="flex items-start gap-4">
        <Calendar className="text-blue-light-500 mt-1 h-5 w-5" />

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-dark-700 text-sm font-semibold">
                Selecciona tus fechas
              </p>

              <p className="text-gray-dark-500 text-xs">
                Elige la fecha de llegada y salida para planificar tu estadia.
              </p>
            </div>

            {(checkIn || checkOut) && onClear && (
              <button
                type="button"
                onClick={onClear}
                className="text-blue-light-600 hover:text-blue-light-700 text-xs font-medium"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-gray-dark-600 flex flex-col gap-2 text-sm font-medium">
              Fecha de llegada
              <input
                type="text"
                placeholder="DD/MM/AAAA"
                value={formatToDisplay(checkIn)}
                onChange={handleCheckInChange}
                maxLength={10}
                className="border-blue-light-150 bg-blue-light-50 text-gray-dark-700 focus:border-blue-light-400 focus:ring-blue-light-100 rounded-2xl border px-4 py-3 outline-none focus:ring-2"
              />
            </label>

            <label className="text-gray-dark-600 flex flex-col gap-2 text-sm font-medium">
              Fecha de salida
              <input
                type="text"
                placeholder="DD/MM/AAAA"
                value={formatToDisplay(checkOut)}
                onChange={handleCheckOutChange}
                maxLength={10}
                className="border-blue-light-150 bg-blue-light-50 text-gray-dark-700 focus:border-blue-light-400 focus:ring-blue-light-100 rounded-2xl border px-4 py-3 outline-none focus:ring-2"
              />
            </label>
          </div>

          <p className="text-gray-dark-400 text-xs">
            Guardaremos estas fechas para que puedas usarlas cuando lances tu
            busqueda.
          </p>
        </div>
      </div>
    </div>
  );
}
