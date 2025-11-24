// src/components/host/crear-recinto/Paso8_Reglas.tsx

import { StepHeader } from "./StepHeader";
import { Clock, ListChecks, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface StepProps {
  data: {
    houseRules: string;
    checkinTime: string;
    checkoutTime: string;
  };
  updateData: (data: Partial<StepProps["data"]>) => void;
}

const MIN_RULES_LENGTH = 20;

export function Paso8_Reglas({ data, updateData }: StepProps) {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const isCheckinValid = data.checkinTime !== "";
  const isCheckoutValid = data.checkoutTime !== "";
  const isRulesValid = data.houseRules.length >= MIN_RULES_LENGTH;
  const isValid = isCheckinValid && isCheckoutValid && isRulesValid;

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col gap-6">
      <StepHeader
        title="Establece las reglas de tu recinto"
        subtitle="Define los horarios clave y las normas de convivencia."
        helpText="Recuerda que ser claro con las reglas desde el principio ayuda a evitar malentendidos. Los huéspedes deben aceptar estas reglas antes de reservar."
      />

      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-slate-800">
          Horarios de Check-in y Check-out
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">
              Hora de Check-in (Llegada)
            </span>

            <div className="relative">
              <Clock className="absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                type="time"
                name="checkinTime"
                value={data.checkinTime}
                onChange={handleChange}
                step="1800"
                className={`relative w-full rounded-xl border-2 bg-white py-2.5 pr-4 pl-10 text-slate-700 transition-colors outline-none ${
                  !isCheckinValid
                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
            </div>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">
              Hora de Check-out (Salida)
            </span>

            <div className="relative">
              <Clock className="absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                type="time"
                name="checkoutTime"
                value={data.checkoutTime}
                onChange={handleChange}
                step="1800"
                className={`relative w-full rounded-xl border-2 bg-white py-2.5 pr-4 pl-10 text-slate-700 transition-colors outline-none ${
                  !isCheckoutValid
                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
            </div>
          </label>
        </div>
      </div>

      <hr className="my-2 border-t border-slate-200" />

      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-slate-800">
          Reglas adicionales
        </h2>

        <p className="text-sm text-slate-600">
          Añade cualquier otra norma específica de tu espacio.
        </p>

        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <textarea
              id="houseRules"
              name="houseRules"
              value={data.houseRules}
              onChange={handleChange}
              rows={10}
              placeholder="Ej: No hacer ruido después de las 10 PM. No dejar la basura fuera..."
              className={`w-full resize-none rounded-xl border-2 bg-white px-4 py-2.5 text-slate-700 transition-colors outline-none ${
                !isRulesValid && data.houseRules.length > 0
                  ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            <span
              className={`text-xs font-medium transition-colors ${
                !isRulesValid ? "text-red-500" : "text-green-600"
              }`}
            >
              {data.houseRules.length} / {MIN_RULES_LENGTH} caracteres mínimos
              recomendados
            </span>
          </div>

          <div className="h-fit rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2">
              <ListChecks className="h-6 w-6 text-blue-600" />
              <h3 className="text-base font-semibold text-slate-800">
                ¿Qué reglas incluir?
              </h3>
            </div>

            <p className="mt-2 mb-3 text-xs text-slate-600">
              Piensa en cosas que sean importantes para ti y tu espacio:
            </p>

            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span className="text-xs text-slate-700">
                  Invitados: ¿Se permiten visitas que no estén en la reserva?
                </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span className="text-xs text-slate-700">
                  Ruido: ¿Hay horarios de silencio? (Ej: &quot;No música alta
                  después de las 10 PM&quot;).
                </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span className="text-xs text-slate-700">
                  Seguridad: (Ej: &quot;Cerrar siempre la puerta principal con
                  llave&quot;).
                </span>
              </li>

              <li className="flex items-start gap-2">
                <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                <span className="text-xs text-slate-700">
                  No incluyas reglas que ya cubrimos (Mascotas, Fumar, Fiestas)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-2 min-h-[60px] transition-all duration-300">
        {!isValid && (
          <div className="animate-in fade-in slide-in-from-top-1 flex flex-col gap-1 rounded-lg border border-red-200 bg-red-50 p-3 duration-300">
            <div className="flex items-center gap-2 text-sm font-medium text-red-700">
              <XCircle className="h-4 w-4" />
              <span>Completa los siguientes campos:</span>
            </div>
            <ul className="list-inside list-disc pl-6 text-xs text-red-600">
              {!isCheckinValid && (
                <li>Selecciona la hora de llegada (Check-in).</li>
              )}
              {!isCheckoutValid && (
                <li>Selecciona la hora de salida (Check-out).</li>
              )}
              {!isRulesValid && (
                <li>
                  Las reglas no cumplen la longitud mínima o están vacías.
                </li>
              )}
            </ul>
          </div>
        )}

        {isValid && showSuccessMessage && (
          <div className="animate-in zoom-in fade-in flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-center duration-300">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-700">
              ¡Reglas y horarios establecidos correctamente!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
