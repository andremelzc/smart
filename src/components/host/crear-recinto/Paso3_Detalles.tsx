// src/components/host/crear-recinto/Paso3_Detalles.tsx

import { Users, BedDouble, Bed, Bath, Ruler, Minus, Plus } from "lucide-react";
import { StepHeader } from "./StepHeader";

interface StepProps {
  data: {
    capacity: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
    areaM2: number;
  };
  updateData: (data: Partial<StepProps["data"]>) => void;
}

interface DetailStepperProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
}

function DetailStepper({
  icon,
  label,
  description,
  value,
  onIncrease,
  onDecrease,
  min = 0,
}: DetailStepperProps) {
  const isMin = value <= min;

  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-4 last-of-type:border-b-0">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-slate-600">{icon}</div>
        <div>
          <h3 className="text-base font-semibold text-slate-800">{label}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrease}
          disabled={isMin}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-300 text-slate-600 transition-all hover:border-blue-600 hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-transparent"
        >
          <Minus className="h-4 w-4" />
        </button>

        <span className="w-8 text-center text-lg font-semibold text-slate-800">
          {value}
        </span>

        <button
          type="button"
          onClick={onIncrease}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-300 text-slate-600 transition-all hover:border-blue-600 hover:bg-blue-600 hover:text-white"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function Paso3_Detalles({ data, updateData }: StepProps) {
  const handleIncrease = (key: keyof StepProps["data"]) => {
    updateData({ [key]: data[key] + 1 });
  };

  const handleDecrease = (key: keyof StepProps["data"], min = 0) => {
    if (data[key] > min) {
      updateData({ [key]: data[key] - 1 });
    }
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      updateData({ areaM2: 0 });
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      updateData({ areaM2: numValue });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <StepHeader
        title="Cuéntanos más sobre tu recinto"
        subtitle="Especifica los detalles básicos que los huéspedes querrán saber."
        helpText="Usa los botones '+' y '-' para ajustar las cantidades. Estos detalles son clave para los filtros de búsqueda de los huéspedes."
      />

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-800">
          Información Clave
        </h2>
        <p className="text-sm text-slate-600">
          Define la capacidad y distribución de tu recinto. (Mínimo 1 huésped y
          1 cama)
        </p>

        <div className="mt-3 rounded-xl border border-slate-200 bg-white px-5">
          <DetailStepper
            icon={<Users className="h-6 w-6" />}
            label="Huéspedes"
            description="Capacidad máxima"
            value={data.capacity}
            min={1}
            onIncrease={() => handleIncrease("capacity")}
            onDecrease={() => handleDecrease("capacity", 1)}
          />

          <DetailStepper
            icon={<BedDouble className="h-6 w-6" />}
            label="Habitaciones"
            description="0 para un estudio (monoambiente)"
            value={data.bedrooms}
            min={0}
            onIncrease={() => handleIncrease("bedrooms")}
            onDecrease={() => handleDecrease("bedrooms", 0)}
          />

          <DetailStepper
            icon={<Bed className="h-6 w-6" />}
            label="Camas"
            description="Total de camas disponibles"
            value={data.beds}
            min={1}
            onIncrease={() => handleIncrease("beds")}
            onDecrease={() => handleDecrease("beds", 1)}
          />

          <DetailStepper
            icon={<Bath className="h-6 w-6" />}
            label="Baños"
            description="Total de baños (enteros)"
            value={data.bathrooms}
            min={0}
            onIncrease={() => handleIncrease("bathrooms")}
            onDecrease={() => handleDecrease("bathrooms", 0)}
          />
        </div>
      </div>

      <hr className="my-2 border-t border-slate-200" />

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-800">
          Detalles Adicionales
        </h2>

        <label className="mt-3 flex flex-col gap-2 text-sm font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-slate-700">
              Área total (m²)
            </span>
            <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
              Opcional
            </span>
          </div>

          <div className="relative mt-1">
            <Ruler className="absolute top-1/2 left-3 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="number"
              name="areaM2"
              value={data.areaM2 > 0 ? data.areaM2 : ""}
              onChange={handleAreaChange}
              placeholder="Ej: 80"
              className="relative w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-12 pl-10 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <span className="absolute top-1/2 right-3 z-10 -translate-y-1/2 text-sm font-medium text-slate-500">
              m²
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
