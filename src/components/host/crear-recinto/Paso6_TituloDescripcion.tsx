// src/components/host/crear-recinto/Paso6_TituloDescripcion.tsx

import { StepHeader } from "./StepHeader";
import { Lightbulb, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface StepProps {
  data: {
    title: string;
    descriptionLong: string;
  };
  updateData: (data: Partial<StepProps["data"]>) => void;
}

const MAX_TITLE_LENGTH = 100;
const MIN_TITLE_LENGTH = 20;
const MIN_DESC_LENGTH = 50;

export function Paso6_TituloDescripcion({ data, updateData }: StepProps) {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const isTitleValid = data.title.length >= MIN_TITLE_LENGTH;
  const isDescValid = data.descriptionLong.length >= MIN_DESC_LENGTH;
  const isValid = isTitleValid && isDescValid;

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
    const { name, value } = e.target;

    if (name === "title" && value.length > MAX_TITLE_LENGTH) {
      return;
    }

    updateData({ [name]: value });
  };

  const titleCharsLeft = MAX_TITLE_LENGTH - data.title.length;

  return (
    <div className="flex flex-col gap-6">
      <StepHeader
        title="Dale un título y una descripción"
        subtitle="Atrae a los huéspedes con un título memorable y una descripción detallada."
        helpText="Tu título y descripción son tu carta de presentación. Sé claro, honesto y acogedor. ¡Destaca lo que te hace único!"
      />

      <div className="flex flex-col gap-2">
        <label
          htmlFor="title"
          className="text-base font-semibold text-slate-800"
        >
          Título
        </label>

        <div className="relative">
          <input
            type="text"
            id="title"
            name="title"
            value={data.title}
            onChange={handleChange}
            placeholder="Ej: Acogedor estudio céntrico con balcón"
            className={`w-full rounded-xl border-2 bg-white py-2.5 px-4 pr-12 outline-none focus:ring-2 focus:ring-blue-100 transition-colors
              ${!isTitleValid && data.title.length > 0 ? 'border-red-300 focus:border-red-400' : 'border-slate-300 focus:border-blue-500'}
            `}
          />

          <span
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium
                       ${
                         titleCharsLeft < 10
                           ? "text-red-500"
                           : "text-slate-400"
                       }`}
          >
            {titleCharsLeft}
          </span>
        </div>

        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-slate-500">
            Intenta incluir el tipo de recinto, una característica clave y la ubicación.
          </p>
          
          <span
            className={`text-xs font-medium whitespace-nowrap ml-2 transition-colors
                       ${
                         isTitleValid
                           ? "text-green-600"
                           : "text-red-500"
                       }`}
          >
            {data.title.length} / {MIN_TITLE_LENGTH} caracteres mínimos
          </span>
        </div>
      </div>

      <hr className="my-2 border-t border-slate-200" />

      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-slate-800">
          Descripción
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div className="flex flex-col gap-2">
            <textarea
              id="descriptionLong"
              name="descriptionLong"
              value={data.descriptionLong}
              onChange={handleChange}
              rows={10}
              placeholder="Empieza a describir tu espacio aquí..."
              className={`w-full rounded-xl border-2 bg-white py-2.5 px-4 outline-none resize-none focus:ring-2 focus:ring-blue-100 transition-colors
                ${!isDescValid && data.descriptionLong.length > 0 ? 'border-red-300 focus:border-red-400' : 'border-slate-300 focus:border-blue-500'}
              `}
            />

            <span
              className={`text-xs font-medium transition-colors
                         ${
                           !isDescValid
                             ? "text-red-500"
                             : "text-green-600"
                         }`}
            >
              {data.descriptionLong.length} / {MIN_DESC_LENGTH} caracteres mínimos recomendados
            </span>
          </div>

          <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 h-fit">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-blue-600" />
              <h3 className="text-base font-semibold text-slate-800">
                ¿No sabes qué poner?
              </h3>
            </div>

            <p className="text-xs text-slate-600 mt-2 mb-3">
              Usa estas preguntas como guía para una descripción perfecta:
            </p>

            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-slate-700">
                  ¿Qué hace único a tu espacio? (Ej: &quot;La vista desde el balcón es increíble al atardecer.&quot;)
                </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-slate-700">
                  ¿A qué tendrán acceso los huéspedes? (Ej: &quot;Acceso completo a la cocina, piscina y gimnasio.&quot;)
                </span>
              </li>

              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-slate-700">
                  ¿Cómo es el vecindario? (Ej: &quot;Es una zona tranquila y residencial, a 10 min a pie del centro.&quot;)
                </span>
              </li>

              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-slate-700">
                  Evita usar mayúsculas (Ej: &quot;OFERTA IMPERDIBLE&quot;).
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
              <span>Completa los campos para continuar:</span>
            </div>
            <ul className="list-disc list-inside text-xs text-red-600 pl-6">
              {!isTitleValid && <li>El título aún es muy corto o está vacío.</li>}
              {!isDescValid && <li>La descripción aún es muy corta o está vacía.</li>}
            </ul>
          </div>
        )}

        {isValid && showSuccessMessage && (
          <div className="p-3 border border-green-200 bg-green-50 rounded-lg text-center flex items-center justify-center gap-2 animate-in zoom-in fade-in duration-300">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700 font-medium">
              ¡Perfecto! Título y descripción listos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}