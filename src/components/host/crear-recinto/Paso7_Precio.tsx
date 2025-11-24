// src/components/host/crear-recinto/Paso7_Precio.tsx

import { StepHeader } from "./StepHeader";
import {
  Lightbulb,
  TrendingUp,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
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
const MIN_PRICE = 10;

export function Paso7_Precio({ data, updateData }: StepProps) {
  const [localPriceString, setLocalPriceString] = useState(
    data.basePriceNight > 0 ? data.basePriceNight.toString() : ""
  );

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const isPriceEmpty = localPriceString === "";
  const isValid = !isPriceEmpty && data.basePriceNight >= MIN_PRICE;

  useEffect(() => {
    let showTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;

    if (isValid) {
      showTimer = setTimeout(() => setShowSuccessMessage(true), 0);
      hideTimer = setTimeout(() => setShowSuccessMessage(false), 3000);
    } else {
      showTimer = setTimeout(() => setShowSuccessMessage(false), 0);
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isValid]);

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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-base font-semibold text-slate-800"
            >
              Precio base por noche
            </label>

            <p className="mb-4 text-sm text-slate-600">
              Este es el precio que cobras por una noche de alojamiento.
            </p>

            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-2xl font-semibold text-slate-600">
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
                className={`w-full rounded-xl border-2 bg-white py-3 pr-24 pl-12 text-3xl font-bold text-slate-700 transition-colors outline-none ${
                  !isValid
                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />

              <span className="absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium text-slate-500">
                / noche
              </span>
            </div>
          </div>

          <div className="rounded-xl border-2 border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-base font-semibold text-slate-800">
              Desglose de ganancia
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Precio base por noche</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(basePrice)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span
                  className="flex items-center gap-1.5 text-slate-600"
                  title="Esta es la tarifa que cobra la plataforma por usar el servicio."
                >
                  Comisión de servicio{" "}
                  <span className="font-medium">
                    ({PLATFORM_FEE_PERCENT * 100}%)
                  </span>
                  <Info className="h-3.5 w-3.5 cursor-help text-slate-400" />
                </span>
                <span className="font-semibold text-red-600">
                  - {formatCurrency(serviceFee)}
                </span>
              </div>

              <hr className="border-t border-slate-200" />

              <div className="flex items-center justify-between pt-1 text-base">
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

        <div className="h-fit rounded-xl border-2 border-blue-200 bg-blue-50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-800">
              Recomendación de precio
            </h3>
          </div>

          <p className="mb-4 text-sm text-slate-600">
            Para recintos similares en tu zona, el precio promedio por noche es
            de:
          </p>

          <div className="my-5 text-center">
            <span className="text-4xl font-bold text-slate-800">
              {formatCurrency(SUGGESTED_PRICE)}
            </span>
          </div>

          <button
            onClick={handleUseSuggestion}
            className="from-blue-light-500 to-blue-vivid-500 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            <TrendingUp className="h-4 w-4" />
            Usar precio sugerido
          </button>

          <p className="mt-3 text-center text-xs text-slate-500">
            Esta es solo una sugerencia. Eres libre de establecer el precio que
            quieras.
          </p>
        </div>
      </div>

      <div className="mt-2 min-h-[60px] transition-all duration-300">
        {!isValid && (
          <div className="animate-in fade-in slide-in-from-top-1 flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 duration-300">
            <XCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-700">
              {isPriceEmpty
                ? "Debes establecer un precio por noche para continuar."
                : `El precio mínimo debe ser ${formatCurrency(MIN_PRICE)}.`}
            </p>
          </div>
        )}

        {isValid && showSuccessMessage && (
          <div className="animate-in zoom-in fade-in flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-center duration-300">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-700">
              ¡Precio válido establecido!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
