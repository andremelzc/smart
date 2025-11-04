// src/components/host/crear-recinto/Paso7_Precio.tsx
import { StepHeader } from './StepHeader';
import { Lightbulb, DollarSign, TrendingUp, Percent, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StepProps {
  data: {
    basePriceNight: number;
    currencyCode: string;
  };
  updateData: (data: Partial<StepProps['data']>) => void;
}

const SUGGESTED_PRICE = 120;
const PLATFORM_FEE_PERCENT = 0.10;

export function Paso7_Precio({ data, updateData }: StepProps) {

  const [localPriceString, setLocalPriceString] = useState(
    data.basePriceNight > 0 ? data.basePriceNight.toString() : ''
  );

  useEffect(() => {
    setLocalPriceString(data.basePriceNight > 0 ? data.basePriceNight.toString() : '');
  }, [data.basePriceNight]);


  const basePrice = data.basePriceNight;
  const serviceFee = basePrice * PLATFORM_FEE_PERCENT;
  const userEarnings = basePrice - serviceFee;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: data.currencyCode,
      minimumFractionDigits: 2,
    }).format(value);
  };
  const currencySymbol = formatCurrency(0).replace(/\d/g, '').replace('.', '').trim().split('')[0]; 


  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      setLocalPriceString(value); 
      
      const numValue = value === '' ? 0 : parseInt(value, 10);
      updateData({ basePriceNight: numValue });
    }
  };

  const handleUseSuggestion = () => {
    setLocalPriceString(SUGGESTED_PRICE.toString());
    updateData({ basePriceNight: SUGGESTED_PRICE });
  };

  return (
    <div className="flex flex-col gap-8">
      
      <StepHeader
        title="Establece tu precio"
        subtitle="Define cuánto quieres cobrar por tu espacio."
        helpText="El precio que definas aquí es la tarifa base. Los huéspedes pagarán esto más las comisiones de la plataforma. Puedes ajustarlo en cualquier momento."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        <div className="flex flex-col gap-8">
          
          <div>
            <label
              htmlFor="price"
              className="text-2xl font-semibold text-blue-light-700"
            >
              Precio base (x1 noche)
            </label>
            <p className="text-md font-semibold text-gray-dark-800 mb-4">
              Este es el precio que cobras por una noche de alojamiento.
            </p>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl text-gray-dark-500">
                {currencySymbol}
              </span>
              <input
                type="text" 
                inputMode="numeric" 
                id="price"
                name="basePriceNight"
                value={localPriceString}
                onChange={handlePriceChange}
                placeholder="120"
                className="w-full rounded-2xl border-2 border-blue-light-300 bg-blue-light-50 
                           py-4 pl-14 pr-24 text-4xl font-bold text-gray-dark-900 outline-none
                           focus:border-blue-light-700 focus:ring-2 focus:ring-blue-light-100"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-lg text-blue-light-800 font-semibold">
                / noche
              </span>
            </div>
          </div>
          
          <div className="rounded-2xl border-2 border-blue-light-300 bg-white p-6">
            <h3 className="text-xl font-semibold text-blue-light-700 mb-4">
              Desglose de ganancia
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-md">
                <span className="text-gray-dark-600">Precio base por noche</span>
                <span className="font-medium text-gray-dark-900">{formatCurrency(basePrice)}</span>
              </div>
              <div className="flex justify-between items-center text-md">
                <span 
                    className="flex items-center gap-1 text-gray-dark-600"
                    title="Esta es la tarifa que cobra la plataforma por usar el servicio."
                    >
                    Comisión de servicio <span className="font-medium">({PLATFORM_FEE_PERCENT * 100}%)</span>
                    <Info className="w-4 h-4 text-gray-dark-400 cursor-help" />
                </span>
                <span className="font-medium text-red-600">- {formatCurrency(serviceFee)}</span>
              </div>
              <hr className="border-t border-dashed border-blue-light-200" />
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold text-gray-dark-900">Ganancia estimada por noche</span>
                <span className="font-bold text-green-600">{formatCurrency(userEarnings)}</span>
              </div>
            </div>
          </div>

        </div>

        <div className="rounded-2xl border-2 border-blue-light-300 bg-blue-light-50 p-6 h-fit">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-10 h-10 text-blue-vivid-700" />
            <h3 className="text-xl font-semibold text-blue-light-700 text-center">
              ¡Recomendación de precio!
            </h3>
          </div>
          <p className="text-gray-dark-600 mt-3 mb-5">
            Para recintos similares en tu zona, el precio promedio por noche es de:
          </p>
          
          <div className="text-center my-4">
            <span className="text-5xl font-bold text-gray-dark-900">
              {formatCurrency(SUGGESTED_PRICE)}
            </span>
          </div>
          
          <button
            onClick={handleUseSuggestion}
            className="w-full inline-flex items-center justify-center border-2 border-blue-light-700 gap-2 rounded-2xl bg-gradient-to-br 
                       from-blue-vivid-500 to-blue-vivid-600 px-5 py-3 text-sm 
                       font-semibold text-white shadow-md transition-all 
                       hover:from-blue-vivid-600 hover:to-blue-vivid-700"
          >
            <TrendingUp className="w-6 h-6" />
            Usar precio sugerido
          </button>
          
          <p className="text-xs text-gray-dark-500 mt-4 text-center">
            Esta es solo una sugerencia. Eres libre de establecer el precio que quieras.
          </p>
        </div>

      </div>
    </div>
  );
}