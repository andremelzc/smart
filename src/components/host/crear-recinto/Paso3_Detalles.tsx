// src/components/host/crear-recinto/Paso3_Detalles.tsx
import { Users, BedDouble, Bed, Bath, Ruler, Minus, Plus } from 'lucide-react';
import { StepHeader } from './StepHeader';

interface StepProps {
  data: {
    capacity: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
    areaM2: number;
  };
  updateData: (data: Partial<StepProps['data']>) => void;
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

function DetailStepper({ icon, label, description, value, onIncrease, onDecrease, min = 0 }: DetailStepperProps) {
  const isMin = value <= min;
  
  return (
    <div className="flex items-center justify-between py-5 border-b border-blue-light-100 last-of-type:border-b-0">
      <div className="flex items-start gap-4">
        <div className="text-gray-dark-700 mt-1">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-dark-800">{label}</h3>
          <p className="text-sm text-gray-dark-500">{description}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onDecrease}
          disabled={isMin}
          className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-blue-light-700 text-blue-light-700 
                     transition-all hover:bg-blue-light-600 hover:text-white hover:border-blue-light-700
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <Minus className="w-5 h-5" />
        </button>
        <span className="text-2xl font-bold text-gray-dark-900 w-10 text-center">
          {value}
        </span>
        <button
          type="button"
          onClick={onIncrease}
          className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-blue-light-700 text-blue-light-700 
                     transition-all hover:bg-blue-light-600 hover:text-white hover:border-blue-light-700"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}


export function Paso3_Detalles({ data, updateData }: StepProps) {

  const handleIncrease = (key: keyof StepProps['data']) => {
    updateData({ [key]: data[key] + 1 });
  };
  const handleDecrease = (key: keyof StepProps['data'], min = 0) => {
    if (data[key] > min) {
      updateData({ [key]: data[key] - 1 });
    }
  };
  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      updateData({ areaM2: 0 });
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      updateData({ areaM2: numValue });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      <StepHeader
        title="Cuéntanos más sobre tu recinto"
        subtitle="Especifica los detalles básicos que los huéspedes querrán saber."
        helpText="Usa los botones '+' y '-' para ajustar las cantidades. Estos detalles son clave para los filtros de búsqueda de los huéspedes."
      />

      <div className="flex flex-col gap-2 ">
        <h2 className="text-2xl font-semibold text-blue-light-700">
          Información Clave
        </h2>
        <p className="text-md text-gray-dark-500">
          Define la capacidad y distribución de tu recinto. (Mínimo 1 huésped y 1 cama)
        </p>

        <div className="mt-4 rounded-2xl border border-blue-light-300 bg-blue-light-50 px-6">
          <DetailStepper
            icon={<Users className="w-8 h-8 text-blue-light-700" />}
            label="Huéspedes"
            description="Capacidad máxima"
            value={data.capacity}
            min={1} 
            onIncrease={() => handleIncrease('capacity')}
            onDecrease={() => handleDecrease('capacity', 1)}
          />
          <DetailStepper
            icon={<BedDouble className="w-8 h-8 text-blue-light-700" />}
            label="Habitaciones"
            description="0 para un estudio (monoambiente)"
            value={data.bedrooms}
            min={0}
            onIncrease={() => handleIncrease('bedrooms')}
            onDecrease={() => handleDecrease('bedrooms', 0)}
          />
          <DetailStepper
            icon={<Bed className="w-8 h-8 text-blue-light-700" />}
            label="Camas"
            description="Total de camas disponibles"
            value={data.beds}
            min={1} 
            onIncrease={() => handleIncrease('beds')}
            onDecrease={() => handleDecrease('beds', 1)}
          />
          <DetailStepper
            icon={<Bath className="w-8 h-8 text-blue-light-700" />}
            label="Baños"
            description="Total de baños (enteros)"
            value={data.bathrooms}
            min={1} 
            onIncrease={() => handleIncrease('bathrooms')}
            onDecrease={() => handleDecrease('bathrooms', 1)}
          />
        </div>
      </div>

      <hr className="my-4 border-t border-blue-light-300" />

      {/* 3. Grupo Opcional: Detalles Adicionales */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-blue-light-700">
          Detalles Adicionales
        </h2>
        
        <label className="flex flex-col gap-2 text-sm font-medium text-gray-dark-600 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-gray-dark-700">
              Área total (m²)
            </span>
            <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-700">
              Opcional
            </span>
          </div>

          <div className="relative mt-1">
            <Ruler className="w-6 h-6 text-blue-light-700 absolute left-4 top-1/4 -translate-y-1/2 z-10" />
            <input
              type="number"
              name="areaM2"
              value={data.areaM2 > 0 ? data.areaM2 : ''}
              onChange={handleAreaChange}
              placeholder="Ej: 80"
              className="relative w-full rounded-2xl border border-blue-light-300 bg-blue-light-50 
                         py-3 pl-12 pr-12 text-gray-dark-700 outline-none
                         focus:border-blue-light-400 focus:ring-2 focus:ring-blue-light-100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-dark-500 font-medium z-10">
              m²
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}