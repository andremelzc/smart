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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">
              Hora de Check-in (Llegada)
            </span>

            <div className="relative">
              <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 z-10" />

              <input
                type="time"
                name="checkinTime"
                value={data.checkinTime}
                onChange={handleChange}
                step="1800"
                className={`relative w-full rounded-xl border-2 bg-white 
                           py-2.5 pl-10 pr-4 text-slate-700 outline-none transition-colors
                           ${!isCheckinValid 
                             ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100" 
                             : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
              />
            </div>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">
              Hora de Check-out (Salida)
            </span>

            <div className="relative">
              <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 z-10" />

              <input
                type="time"
                name="checkoutTime"
                value={data.checkoutTime}
                onChange={handleChange}
                step="1800"
                className={`relative w-full rounded-xl border-2 bg-white 
                           py-2.5 pl-10 pr-4 text-slate-700 outline-none transition-colors
                           ${!isCheckoutValid 
                             ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100" 
                             : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div className="flex flex-col gap-2">
            <textarea
              id="houseRules"
              name="houseRules"
              value={data.houseRules}
              onChange={handleChange}
              rows={10}
              placeholder="Ej: No hacer ruido después de las 10 PM. No dejar la basura fuera..."
              className={`w-full rounded-xl border-2 bg-white 
                         py-2.5 px-4 text-slate-700 outline-none resize-none transition-colors
                         ${!isRulesValid && data.houseRules.length > 0
                           ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100" 
                           : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
            />

            <span
              className={`text-xs font-medium transition-colors
                         ${
                           !isRulesValid
                             ? "text-red-500"
                             : "text-green-600"
                         }`}
            >
              {data.houseRules.length} / {MIN_RULES_LENGTH} caracteres mínimos recomendados
            </span>
          </div>

          <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 h-fit">
            <div className="flex items-center gap-2">
              <ListChecks className="w-6 h-6 text-blue-600" />
              <h3 className="text-base font-semibold text-slate-800">
                ¿Qué reglas incluir?
              </h3>
            </div>

            <p className="text-xs text-slate-600 mt-2 mb-3">
              Piensa en cosas que sean importantes para ti y tu espacio:
            </p>

            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-slate-700">
                  Invitados: ¿Se permiten visitas que no estén en la reserva?
                </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-slate-700">
                  Ruido: ¿Hay horarios de silencio? (Ej: &quot;No música alta después de las 10 PM&quot;).
                </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-slate-700">
                  Seguridad: (Ej: &quot;Cerrar siempre la puerta principal con llave&quot;).
                </span>
              </li>

              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
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
          <div className="p-3 border border-red-200 bg-red-50 rounded-lg flex flex-col gap-1 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
              <XCircle className="w-4 h-4" />
              <span>Completa los siguientes campos:</span>
            </div>
            <ul className="list-disc list-inside text-xs text-red-600 pl-6">
              {!isCheckinValid && <li>Selecciona la hora de llegada (Check-in).</li>}
              {!isCheckoutValid && <li>Selecciona la hora de salida (Check-out).</li>}
              {!isRulesValid && <li>Las reglas no cumplen la longitud mínima o están vacías.</li>}
            </ul>
          </div>
        )}

        {isValid && showSuccessMessage && (
          <div className="p-3 border border-green-200 bg-green-50 rounded-lg text-center flex items-center justify-center gap-2 animate-in zoom-in fade-in duration-300">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700 font-medium">
              ¡Reglas y horarios establecidos correctamente!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}