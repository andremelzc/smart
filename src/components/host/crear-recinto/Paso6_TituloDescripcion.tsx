// src/components/host/crear-recinto/Paso6_TituloDescripcion.tsx
import { StepHeader } from './StepHeader';
import { Lightbulb, CheckCircle, XCircle } from 'lucide-react';

interface StepProps {
  data: {
    title: string;
    descriptionLong: string;
  };
  updateData: (data: Partial<StepProps['data']>) => void;
}

const MAX_TITLE_LENGTH = 100;
const MIN_DESC_LENGTH = 50; 

export function Paso6_TituloDescripcion({ data, updateData }: StepProps) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'title' && value.length > MAX_TITLE_LENGTH) {
      return;
    }
    
    updateData({ [name]: value });
  };

  const titleCharsLeft = MAX_TITLE_LENGTH - data.title.length;

  return (
    <div className="flex flex-col gap-8">
      
      <StepHeader
        title=" Dale un titulo y una descripcion"
        subtitle="Atrae a los huespedes con un titulo memorable y una descripcion detallada."
        helpText="Tu titulo y descripcion son tu carta de presentacion. Se claro, honesto y acogedor. Destaca lo que te hace unico!"
      />
      
      <div className="flex flex-col gap-2">
        <label
          htmlFor="title"
          className="text-2xl font-semibold text-blue-light-700"
        >
          Titulo
        </label>
        
        <div className="relative">
          <input
            type="text"
            id="title"
            name="title"
            value={data.title}
            onChange={handleChange}
            placeholder="Ej: Acogedor estudio centrico con balcon"
            className="w-full rounded-2xl border-2 border-blue-light-300 bg-blue-light-50 
                       py-3 px-4 text-gray-dark-700 outline-none
                       focus:border-blue-light-700 focus:ring-2 focus:ring-blue-light-100"
          />
          <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium
                           ${titleCharsLeft < 10 ? 'text-red-500' : 'text-gray-dark-400'}`}
          >
            {titleCharsLeft}
          </span>
        </div>
        <p className="text-sm text-gray-dark-500 mt-1">
           Intenta incluir el tipo de recinto, una caracteristica clave y la ubicacion.
        </p>
      </div>

      <hr className="my-4 border-t border-blue-light-300" />

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-blue-light-700">
          Descripcion
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          
          <div className="flex flex-col gap-2">
            <textarea
              id="descriptionLong"
              name="descriptionLong"
              value={data.descriptionLong}
              onChange={handleChange}
              rows={12}
              placeholder="Empieza a describir tu espacio aqui..."
              className="w-full rounded-2xl border-2 border-blue-light-300 bg-blue-light-50 
                         py-3 px-4 text-gray-dark-700 outline-none
                         focus:border-blue-light-700 focus:ring-2 focus:ring-blue-light-100"
            />
            <span className={`text-sm font-medium
                             ${data.descriptionLong.length < MIN_DESC_LENGTH ? 'text-red-500' : 'text-green-600'}`}
            >
               {data.descriptionLong.length} / {MIN_DESC_LENGTH} caracteres minimos recomendados
            </span>
          </div>

          <div className="rounded-2xl border-2 border-blue-light-300 bg-blue-light-50 p-6 h-fit">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-blue-vivid-500" />
              <h3 className="text-xl font-semibold text-blue-light-700">
                No sabes que poner?
              </h3>
            </div>
            <p className="text-gray-dark-400 mt-3 mb-4">
              Usa estas preguntas como guia para una descripcion perfecta:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-dark-700">
                  Que hace unico a tu espacio? (Ej: &quot;La vista desde el balcon es increible al atardecer.&quot;)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-dark-700">
                  A que tendran acceso los huespedes? (Ej: &quot;Acceso completo a la cocina, piscina y gimnasio.&quot;)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-dark-700">
                  Como es el vecindario? (Ej: &quot;Es una zona tranquila y residencial, a 10 min a pie del centro.&quot;)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                <span className="text-gray-dark-700">
                  Evita usar mayusculas (Ej: &quot;OFERTA IMPERDIBLE&quot;).
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}