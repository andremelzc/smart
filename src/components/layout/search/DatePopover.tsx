import { Calendar } from "lucide-react";

interface DatePopoverProps {
  checkIn?: string;
  checkOut?: string;
  onChange: (next: { checkIn?: string; checkOut?: string }) => void;
}

export function DatePopover({ checkIn, checkOut, onChange }: DatePopoverProps) {
  return (
    <div className="absolute left-1/2 top-[calc(100%+0.75rem)] z-30 w-full max-w-xl -translate-x-1/2 rounded-3xl border border-blue-light-200 bg-white p-5 shadow-xl">
      <div className="flex items-start gap-4">
        <Calendar className="mt-1 h-5 w-5 text-blue-light-500" />
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-dark-700">Selecciona tus fechas</p>
            <p className="text-xs text-gray-dark-500">Elige la fecha de llegada y salida para planificar tu estadia.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
              Fecha de llegada
              <input
                type="date"
                value={checkIn ?? ""}
                onChange={(event) => onChange({ checkIn: event.target.value, checkOut })}
                className="rounded-2xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600">
              Fecha de salida
              <input
                type="date"
                value={checkOut ?? ""}
                onChange={(event) => onChange({ checkIn, checkOut: event.target.value })}
                className="rounded-2xl border border-blue-light-150 bg-blue-light-50 px-4 py-3 text-gray-dark-700 outline-none focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
              />
            </label>
          </div>
          <p className="text-xs text-gray-dark-400">
            Guardaremos estas fechas para que puedas usarlas cuando lances tu busqueda.
          </p>
        </div>
      </div>
    </div>
  );
}
