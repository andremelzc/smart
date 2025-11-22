// src/components/host/crear-recinto/Paso7_Precio.tsx

import { StepHeader } from "./StepHeader";
import { Lightbulb, TrendingUp, Info } from "lucide-react";
import { useState, useEffect, startTransition } from "react";

interface StepProps {
  data: {
    basePriceNight: number;
    currencyCode: string;
  };
  updateData: (data: Partial<StepProps["data"]>) => void;
}

const SUGGESTED_PRICE = 120;
const PLATFORM_FEE_PERCENT = 0.1;

export function Paso7_Precio({ data, updateData }: StepProps) {
  const [localPriceString, setLocalPriceString] = useState(
    data.basePriceNight > 0 ? data.basePriceNight.toString() : ""
  );

  useEffect(() => {
    const newStr =
      data.basePriceNight > 0 ? data.basePriceNight.toString() : "";

    if (newStr !== localPriceString) {
      startTransition(() => setLocalPriceString(newStr));
    }
  }, [data.basePriceNight, localPriceString]);

  const basePrice = data.basePriceNight;
  const serviceFee = basePrice * PLATFORM_FEE_PERCENT;
  const userEarnings = basePrice - serviceFee;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: data.currencyCode,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const currencySymbol = formatCurrency(0)
    .replace(/\d/g, "")
    .replace(".", "")
    .trim()
    .split("")[0];

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "" || /^[0-9]+$/.test(value)) {
      setLocalPriceString(value);
      const numValue = value === "" ? 0 : parseInt(value, 10);
      updateData({ basePriceNight: numValue });
    }
  };

  const handleUseSuggestion = () => {
    setLocalPriceString(SUGGESTED_PRICE.toString());
    updateData({ basePriceNight: SUGGESTED_PRICE });
  };

  return (
    <div className="flex flex-col gap-6">
      <StepHeader
        title="Establece tu precio"
        subtitle="Define cuánto quieres cobrar por tu espacio."
        helpText="El precio que definas aquí es la tarifa base. Los huéspedes pagarán esto más las comisiones de la plataforma. Puedes ajustarlo en cualquier momento."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div>
            <label
              htmlFor="price"
              className="text-base font-semibold text-slate-800 block mb-2"
            >
              Precio base por noche
            </label>

            <p className="text-sm text-slate-600 mb-4">
              Este es el precio que cobras por una noche de alojamiento.
            </p>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-slate-600">
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
                className="w-full rounded-xl border-2 border-slate-300 bg-white 
                           py-3 pl-12 pr-24 text-3xl font-bold text-slate-700 outline-none
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">
                / noche
              </span>
            </div>
          </div>

          <div className="rounded-xl border-2 border-slate-200 bg-white p-5">
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              Desglose de ganancia
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">
                  Precio base por noche
                </span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(basePrice)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span
                  className="flex items-center gap-1.5 text-slate-600"
                  title="Esta es la tarifa que cobra la plataforma por usar el servicio."
                >
                  Comisión de servicio{" "}
                  <span className="font-medium">
                    ({PLATFORM_FEE_PERCENT * 100}%)
                  </span>
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                </span>
                <span className="font-semibold text-red-600">
                  - {formatCurrency(serviceFee)}
                </span>
              </div>

              <hr className="border-t border-slate-200" />

              <div className="flex justify-between items-center text-base pt-1">
                <span className="font-semibold text-slate-800">
                  Ganancia estimada por noche
                </span>
                <span className="font-bold text-green-600">
                  {formatCurrency(userEarnings)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5 h-fit">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-6 h-6 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-800">
              Recomendación de precio
            </h3>
          </div>

          <p className="text-sm text-slate-600 mb-4">
            Para recintos similares en tu zona, el precio promedio por noche es de:
          </p>

          <div className="text-center my-5">
            <span className="text-4xl font-bold text-slate-800">
              {formatCurrency(SUGGESTED_PRICE)}
            </span>
          </div>

          <button
            onClick={handleUseSuggestion}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl 
                       bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white 
                       shadow-sm transition-all hover:bg-blue-700 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <TrendingUp className="w-4 h-4" />
            Usar precio sugerido
          </button>

          <p className="text-xs text-slate-500 mt-3 text-center">
            Esta es solo una sugerencia. Eres libre de establecer el precio que quieras.
          </p>
        </div>
      </div>
    </div>
  );
}